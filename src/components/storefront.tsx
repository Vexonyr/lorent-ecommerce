'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CatalogProduct } from '@/lib/products';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type SortMode = 'featured' | 'price-asc' | 'price-desc';

export function Storefront({ stage, catalogProducts }: { stage: number; catalogProducts: CatalogProduct[] }) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState('');

  const visible = useMemo(() => {
    const filtered = catalogProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (sortMode === 'featured') return filtered;

    return [...filtered].sort((a, b) => {
      const aPrice = a.priceInCents ?? Number.MAX_SAFE_INTEGER;
      const bPrice = b.priceInCents ?? Number.MAX_SAFE_INTEGER;
      return sortMode === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
    });
  }, [catalogProducts, query, sortMode]);

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = catalogProducts.reduce((sum, product) => {
    const quantity = cart[product.id] || 0;
    return sum + (product.priceInCents ?? 0) * quantity;
  }, 0);

  const heroProduct = catalogProducts.find(product => product.imageUrl) ?? catalogProducts[0];

  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setNotice('Conectando ao checkout seguro…');

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerName: fields.get('name'),
        customerEmail: fields.get('email'),
        customerPhone: fields.get('phone') || undefined,
        items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
      }),
    });

    const result = await response.json();
    if (response.ok && result.checkoutUrl) window.location.assign(result.checkoutUrl);
    else setNotice(result.error || 'Não foi possível iniciar o checkout.');
  }

  return <>
    <div className="announcement-bar">LORENT · COMPRA ONLINE · ATENDIMENTO PERSONALIZADO</div>

    <header className="store-header">
      <Link className="wordmark" href="/">LORENT<span>®</span></Link>

      <nav aria-label="Navegação principal">
        <a href="#colecao">Relógios</a>
        <a href="#sobre">A Lorent</a>
        <a href="#contato">Contato</a>
      </nav>

      <div className="header-actions">
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
          <span>{visible.length} produtos</span>
        </div>

        <div className="shop-toolbar">
          <label className="shop-search">
            <span>Buscar produtos</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar por modelo"
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
                  <button
                    className="add-to-bag"
                    disabled={product.priceInCents === null}
                    onClick={() => {
                      setCart(current => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
                      setNotice(product.name + ' adicionado à sacola.');
                    }}
                  >
                    Adicionar à sacola
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visible.length === 0 && <div className="empty-state">Nenhum produto encontrado.</div>}
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

        <div className="cart-panel">
          {count === 0 ? (
            <div className="empty-cart">
              <strong>Sua sacola está vazia.</strong>
              <p>Adicione um relógio para começar seu pedido.</p>
              <a className="shop-button shop-button-dark" href="#colecao">Ver produtos</a>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {catalogProducts.filter(product => cart[product.id]).map(product => (
                  <div className="cart-line" key={product.id}>
                    <div className="cart-line-copy">
                      <strong>{product.name}</strong>
                      <span>Quantidade: {cart[product.id]}</span>
                    </div>
                    <strong className="cart-line-price">
                      {product.priceInCents === null ? '' : money.format(product.priceInCents * cart[product.id] / 100)}
                    </strong>
                    <button onClick={() => setCart(current => {
                      const next = { ...current };
                      delete next[product.id];
                      return next;
                    })}>Remover</button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div><span>Itens</span><strong>{count}</strong></div>
                <div className="cart-total"><span>Subtotal</span><strong>{money.format(subtotal / 100)}</strong></div>
              </div>

              <form className="checkout-form" onSubmit={checkout}>
                <h3>Dados para continuar</h3>
                <label>Nome completo<input required name="name" placeholder="Seu nome"/></label>
                <label>E-mail<input required name="email" type="email" placeholder="voce@email.com"/></label>
                <label>Telefone (opcional)<input name="phone" placeholder="(00) 00000-0000"/></label>
                <button className="shop-button shop-button-dark checkout-button" type="submit">Continuar para pagamento</button>
              </form>
            </>
          )}

          {notice && <p className="notice" role="status">{notice}</p>}
        </div>
      </section>
    </main>

    <footer id="contato">
      <Link className="wordmark" href="/">LORENT<span>®</span></Link>
      <p>RELÓGIOS QUE CONTAM SUA HISTÓRIA</p>
      <span>© LORENT</span>
    </footer>
  </>;
}
