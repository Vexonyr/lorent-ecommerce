import 'dotenv/config';
import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
async function main(){const email=process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_INITIAL_PASSWORD;if(!email||!password||password.length<12)throw new Error('Defina ADMIN_INITIAL_EMAIL e ADMIN_INITIAL_PASSWORD (mínimo 12 caracteres) no ambiente.');const passwordHash=await hash(password,12);await prisma.adminUser.upsert({where:{email},update:{passwordHash},create:{email,passwordHash}});console.log(`Administrador configurado: ${email}`);}
main().finally(async()=>prisma.$disconnect());
