import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { const products = await prisma.product.findMany({ where: { active: true }, include: { stock: true }, orderBy: { id: 'asc' } }); return NextResponse.json(products); }
