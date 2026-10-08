import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentCustomer } from '@/lib/customer-auth';
import { prisma } from '@/lib/prisma';
import { isStoreOrigin } from '@/lib/request-origin';

const schema = z.object({
  customerId: z.string(),
  items: z.array(z.object({ productId: z.string().min(1).max(200), quantity: z.number().int().min(1).max(20), selected: z.boolean() })).max(30),
});

export async function GET() {
  const session = await currentCustomer();
  if (!session) return NextResponse.json({ error: 'Entre para acessar sua sacola.' }, { status: 401 });
  const items = await prisma.cartItem.findMany({ where: { userId: session.user.id, product: { active: true } }, select: { productId: true, quantity: true, selected: true }, orderBy: { updatedAt: 'asc' } });
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  if (!isStoreOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  const session = await currentCustomer();
  if (!session) return NextResponse.json({ error: 'Entre para salvar sua sacola.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Sacola inválida.' }, { status: 400 });
  if (parsed.data.customerId !== session.user.id) return NextResponse.json({ error: 'A conta foi alterada. Recarregue a página.' }, { status: 409 });
  const ids = [...new Set(parsed.data.items.map(item => item.productId))];
  if (ids.length !== parsed.data.items.length) return NextResponse.json({ error: 'Há produtos repetidos.' }, { status: 400 });
  const products = await prisma.product.count({ where: { id: { in: ids }, active: true } });
  if (products !== ids.length) return NextResponse.json({ error: 'Um produto não está mais disponível.' }, { status: 409 });
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${session.user.id}))`;
    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
    if (parsed.data.items.length) await tx.cartItem.createMany({ data: parsed.data.items.map(item => ({ ...item, userId: session.user.id })) });
  });
  return NextResponse.json({ ok: true });
}
