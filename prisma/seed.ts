import { prisma } from '../src/lib/prisma';

async function main() {
  for (let index = 1; index <= 23; index++) {
    const number = String(index).padStart(2, '0');
    const id = 'modelo-' + number;
    await prisma.product.upsert({
      where: { id },
      update: {},
      create: { id, name: 'Modelo ' + number },
    });
  }
  console.log('23 cadastros básicos de modelos criados, sem foto, preço ou estoque presumido.');
}

main().finally(async () => prisma.$disconnect());
