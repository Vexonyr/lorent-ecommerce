import { Storefront } from '@/components/storefront';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const catalogProducts = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, imageUrl: true, priceInCents: true },
    orderBy: { id: 'asc' },
  });
  return <Storefront stage={4} catalogProducts={catalogProducts} />;
}
