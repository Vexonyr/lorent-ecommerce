import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET(){if(!await currentAdmin())return NextResponse.json({error:'Não autorizado.'},{status:401});return NextResponse.json(await prisma.order.findMany({include:{items:{include:{product:true}}},orderBy:{createdAt:'desc'},take:100}));}
