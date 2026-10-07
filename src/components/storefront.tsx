'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CatalogProduct } from '@/lib/products';
import { CustomerMenu } from '@/components/customer-menu';
import { useCart } from '@/components/cart-provider';
import { CartPanel } from '@/components/cart-panel';
import { AddToCart } from '@/components/add-to-cart';
import { searchProducts } from '@/lib/cart';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type SortMode = 'featured' | 'price-asc' | 'price-desc';

export function Storefront({ catalogProducts }: { catalogProducts: CatalogProduct[] }) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const { items } = useCart();

  const visible = useMemo(() => {
    const filtered = searchProducts(catalogProducts, query);

    if (sortMode === 'featured') return filtered;

    return [...filtered].sort((a, b) => {
      if (a.priceInCents === null) return b.priceInCents === null ? 0 : 1;
      if (b.priceInCents === null) return -1;
      return sortMode === 'price-asc' ? a.priceInCents - b.priceInCents : b.priceInCents - a.priceInCents;
    });
  }, [catalogProducts, query, sortMode]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const heroProduct = catalogProducts.find(product => product.imageUrl) ?? catalogProducts[0];

  return <>
    <div className="announcement-bar">LORENT · COMPRA ONLINE · ATENDIMENTO PERSONALIZADO</div>

    <header className="store-header">
      <Link className="brand-lockup" href="/" aria-label="Lorent - início">
        <img className="brand-mark" src="/brand/lorent-mark.svg" alt=""/>
        <span className="brand-name">LORENT<small>®</small></span>
      </Link>

      <nav aria-label="Navegação principal">
        <a href="#colecao">Relógios</a>
        <a href="#sobre">A Lorent</a>
        <a href="#contato">Contato</a>
      </nav>

      <div className="header-actions">
        <CustomerMenu />
        <a href="#colecao">Buscar</a>
        <a className="bag-link" href="#pedido">Sacola <b>{count}</b></a>
      </div>
    </header>

    <main>
      <section className="shop-hero">
        <div className="shop-hero-copy">
          <p className="eyebrow">COLEÇÃO LORENT</p>
          <h1>Relógios que contam sua história.</h1>
          <p>Escolha seu modelo, adicione à sacola e siga para a finalização do pedido.</p>
          <div className="hero-actions">
            <a className="shop-button shop-button-dark" href="#colecao">Comprar relógios</a>
            <a className="shop-text-link" href="#sobre">Conhecer a Lorent →</a>
          </div>
        </div>

        <div className="shop-hero-media">
          <img
            src={heroProduct?.imageUrl || '/catalogo/placeholder-white.svg'}
            alt={heroProduct?.imageUrl ? heroProduct.name : ''}
            aria-hidden={!heroProduct?.imageUrl}
          />
        </div>
      </section>

      <section className="commerce-benefits" aria-label="Benefícios da loja">
        <div><strong>Compra online</strong><span>Escolha e finalize pelo site.</span></div>
        <div><strong>Coleção Lorent</strong><span>Todos os modelos em um só lugar.</span></div>
        <div><strong>Atendimento</strong><span>Suporte personalizado durante a compra.</span></div>
      </section>

      <section id="colecao" className="shop-catalog">
        <div className="shop-section-head">
          <div>
            <p className="eyebrow">LOJA</p>
            <h2>Todos os relógios</h2>
          </div>
          <span role="status" aria-live="polite">{visible.length} produtos</span>
        </div>

        <div className="shop-toolbar">
          <label className="shop-search">
            <span>Buscar produtos</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Modelo, descrição ou referência"
              type="search"
              maxLength={120}
            />
          </label>

          <label className="shop-sort">
            <span>Ordenar por</span>
            <select value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)}>
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </label>
        </div>

        <div className="shop-product-grid">
          {visible.map(product => (
            <article className="shop-product-card" key={product.id}>
              <Link href={'/produto/' + product.id} className="shop-product-image" aria-label={'Abrir ' + product.name}>
                <img
                  src={product.imageUrl || '/catalogo/placeholder-white.svg'}
                  alt={product.imageUrl ? product.name : ''}
                  aria-hidden={!product.imageUrl}
                />
              </Link>

              <div className="shop-product-body">
                <div className="shop-product-meta">
                  <p className="shop-product-kicker">LORENT</p>
                  <Link href={'/produto/' + product.id} className="shop-product-name">{product.name}</Link>
                  <p className={'shop-product-price' + (product.priceInCents === null ? ' unavailable' : '')}>
                    {product.priceInCents === null ? 'Preço em definição' : money.format(product.priceInCents / 100)}
                  </p>
                </div>

                <div className="shop-product-actions">
                  <Link href={'/produto/' + product.id} className="details-link">Ver detalhes</Link>
                  <AddToCart productId={product.id} name={product.name} stock={product.stock?.quantity ?? null} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {visible.length === 0 && <div className="empty-state"><p>Nenhum produto encontrado para “{query}”.</p><button type="button" className="shop-text-link" onClick={() => setQuery('')}>Limpar busca</button></div>}
      </section>

      <section id="sobre" className="shop-about">
        <div>
          <p className="eyebrow">A LORENT</p>
          <h2>Uma coleção feita para marcar presença.</h2>
        </div>
        <p>A Lorent reúne relógios pensados para transformar cada escolha em algo pessoal, duradouro e memorável.</p>
      </section>

      <section id="pedido" className="cart-section">
        <div className="cart-heading">
          <p className="eyebrow">SACOLA</p>
          <h2>Seu pedido</h2>
          <p>Revise os itens antes de continuar para o checkout.</p>
        </div>

        <CartPanel products={catalogProducts} />
      </section>
    </main>

    <footer id="contato">
      <Link className="wordmark" href="/">LORENT<span>®</span></Link>
      <p>RELÓGIOS QUE CONTAM SUA HISTÓRIA</p>
      <span>© LORENT</span>
    </footer>
  </>;
}
