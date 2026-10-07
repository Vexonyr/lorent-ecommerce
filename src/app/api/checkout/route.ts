import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentCustomer } from '@/lib/customer-auth';
import { isStoreOrigin } from '@/lib/request-origin';

const schema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.email(),
  customerPhone: z.string().max(40).optional(),
  items: z.array(z.object({ productId: z.string().min(1).max(200), quantity: z.number().int().min(1).max(20) })).min(1).max(30).refine(items => new Set(items.map(item => item.productId)).size === items.length),
});

export async function POST(request: Request) {
  if (!isStoreOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_SITE_URL) return NextResponse.json({ error: 'Checkout não configurado.' }, { status: 503 });
  let orderId: string | undefined;
  try {
    const session = await currentCustomer();
    const customerName = session?.user.name ?? parsed.data.customerName;
    const customerEmail = session?.user.email ?? parsed.data.customerEmail;
    const order = await prisma.$transaction(async tx => {
      let totalInCents = 0;
      const lines: { productId: string; quantity: number; unitPriceInCents: number }[] = [];
      for (const item of parsed.data.items) {
        const product = await tx.product.findFirst({ where: { id: item.productId, active: true } });
        if (!product || product.priceInCents === null || product.priceInCents <= 0) throw new Error('PRICE_REQUIRED');
        const stockItem = await tx.stock.findUnique({ where: { productId: product.id } });
        if (stockItem) {
          const reserved = await tx.stock.updateMany({ where: { productId: product.id, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity } } });
          if (reserved.count !== 1) throw new Error('OUT_OF_STOCK');
        }
        totalInCents += product.priceInCents * item.quantity;
        lines.push({ productId: product.id, quantity: item.quantity, unitPriceInCents: product.priceInCents });
      }
      return tx.order.create({ data: { customerId: session?.user.id, customerName, customerEmail, customerPhone: parsed.data.customerPhone, totalInCents, status: 'AWAITING_PAYMENT', items: { create: lines } } });
    });
    orderId = order.id;
    const stored = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: { include: { product: true } } } });
    const preference = await new Preference(new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })).create({
      body: {
        external_reference: order.id,
        notification_url: process.env.NEXT_PUBLIC_SITE_URL + '/api/payments/webhook',
        items: stored.items.map(item => ({ id: item.productId, title: item.product.name, quantity: item.quantity, unit_price: item.unitPriceInCents / 100, currency_id: 'BRL' })),
        payer: { name: customerName, email: customerEmail },
      },
    });
    return NextResponse.json({ orderId: order.id, checkoutUrl: preference.init_point }, { status: 201 });
  } catch (error) {
    if (orderId) {
      await prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (order?.status === 'AWAITING_PAYMENT') {
          await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
          for (const item of order.items) await tx.stock.updateMany({ where: { productId: item.productId }, data: { quantity: { increment: item.quantity } } });
        }
      }).catch(() => undefined);
    }
    const message = error instanceof Error ? error.message : '';
    if (message === 'PRICE_REQUIRED') return NextResponse.json({ error: 'Há modelos sem preço cadastrado.' }, { status: 409 });
    if (message === 'OUT_OF_STOCK') return NextResponse.json({ error: 'Estoque insuficiente.' }, { status: 409 });
    return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 502 });
  }
}
