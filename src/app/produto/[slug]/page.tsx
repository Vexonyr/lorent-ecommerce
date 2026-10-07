import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { id: slug, active: true } });

  if (!product) notFound();

  return <main className="detail-page">
    <header className="topbar">
      <Link className="wordmark" href="/">LORENT<span>®</span></Link>
      <nav aria-label="Navegação do produto"><Link href="/#colecao">Coleção</Link></nav>
      <Link className="detail-back" href="/#colecao">← Voltar</Link>
    </header>

    <section className="detail-layout">
      <div className="detail-gallery">
        <div className="detail-main-image" aria-label={'Foto de ' + product.name}>
          {product.imageUrl
            ? <img className="product-photo" src={product.imageUrl} alt={product.name}/>
            : <div className="detail-fallback"><span>LORENT</span><strong>{product.name.slice(-2)}</strong><small>MODELO</small></div>}
        </div>
        <div className="detail-gallery-note"><span>LORENT</span><span>COLEÇÃO OFICIAL</span></div>
      </div>

      <aside className="detail-copy">
        <p className="eyebrow">COLEÇÃO LORENT</p>
        <h1>{product.name}</h1>
        <p className="detail-subtitle">Relógio Lorent</p>
        <p className={'detail-price' + (product.priceInCents === null ? ' unavailable' : '')}>
          {product.priceInCents === null ? 'Preço em definição' : money.format(product.priceInCents / 100)}
        </p>

        <div className="detail-divider"/>
        <p className="detail-description">Uma peça da coleção Lorent apresentada com foco nos detalhes, proporções e acabamento do modelo.</p>

        <a className="button primary-button detail-cta" href="/#colecao">Ver coleção completa <span>→</span></a>

        <div className="detail-service">
          <div><strong>Atendimento</strong><span>Suporte personalizado para sua escolha.</span></div>
          <div><strong>Compra online</strong><span>Fluxo de pedido integrado ao site.</span></div>
        </div>
      </aside>
    </section>
  </main>;
}
