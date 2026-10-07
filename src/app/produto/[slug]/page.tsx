import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function ProductPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { id: slug, active: true } });
  if (!product) notFound();
  return <main className="detail-page"><header className="topbar"><Link className="wordmark" href="/">LORENT<span>®</span></Link><Link href="/">← Voltar à coleção</Link></header><section className="detail-layout">
    <div className="product-detail-mark" aria-label={'Foto de '+product.name}>{product.imageUrl ? <img className="product-photo" src={product.imageUrl} alt={product.name}/> : <><span>LORENT</span><strong>{product.name.slice(-2)}</strong><small>MODELO</small></>}</div>
    <div className="detail-copy"><p className="eyebrow">COLEÇÃO LORENT</p><h1>{product.name}</h1><p className="intro">Cadastro do modelo.</p><p className="detail-price">{product.priceInCents === null ? 'Preço em definição' : money.format(product.priceInCents/100)}</p><p className="muted">Informações complementares poderão ser incluídas após validação com a Lorent.</p><a className="button" href="/#colecao">Voltar aos modelos <span>↗</span></a></div>
  </section></main>;
}
