import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const schema = z.object({
    productId: z.string(),
    priceInCents: z.number().int().positive().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    quantity: z.number().int().min(0).max(100000).optional(),
    active: z.boolean().optional(),
  });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  const { productId, priceInCents, imageUrl, quantity, active } = parsed.data;
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(priceInCents !== undefined ? { priceInCents } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(quantity !== undefined ? { stock: { upsert: { create: { quantity }, update: { quantity } } } } : {}),
    },
    include: { stock: true },
  });
  return NextResponse.json(product);
}
