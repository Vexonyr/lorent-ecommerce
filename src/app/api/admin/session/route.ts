import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { adminCookie, issueAdminToken } from '@/lib/auth';
const schema=z.object({email:z.email(),password:z.string().min(1).max(256)});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Credenciais inválidas.'},{status:400});const user=await prisma.adminUser.findUnique({where:{email:parsed.data.email.toLowerCase()}});if(!user||!(await compare(parsed.data.password,user.passwordHash)))return NextResponse.json({error:'Credenciais inválidas.'},{status:401});try{const token=await issueAdminToken(user.email);const response=NextResponse.json({ok:true});response.cookies.set(adminCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});return response;}catch{return NextResponse.json({error:'Sessão não configurada.'},{status:503});}}
export async function DELETE(){const response=NextResponse.json({ok:true});response.cookies.set(adminCookie,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return response;}
