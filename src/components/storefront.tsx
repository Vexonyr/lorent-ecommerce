'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CatalogProduct } from '@/lib/products';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function Storefront({ stage, catalogProducts }: { stage: number; catalogProducts: CatalogProduct[] }) {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState('');

  const visible = useMemo(
    () => catalogProducts.filter(product => product.name.toLowerCase().includes(query.toLowerCase())),
    [catalogProducts, query],
  );
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
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
    <header className="topbar">
      <Link className="wordmark" href="/">LORENT<span>®</span></Link>
      <nav aria-label="Navegação principal">
        <a href="#colecao">Relógios</a>
        <a href="#sobre">A Lorent</a>
        <a href="#contato">Contato</a>
      </nav>
      <a className="cart-link" href="#pedido">Sacola <b>{count}</b></a>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">LORENT · HOROLOGIA</p>
          <h1>Relógios que<br/><i>contam sua história.</i></h1>
          <p className="intro">Uma coleção criada para transformar presença, estilo e tempo em uma escolha pessoal.</p>
          <a className="button primary-button" href="#colecao">Ver coleção <span>→</span></a>
        </div>

        <div className="hero-product" aria-label="Destaque da coleção Lorent">
          {heroProduct?.imageUrl
            ? <img src={heroProduct.imageUrl} alt={heroProduct.name}/>
            : <div className="hero-fallback"><span>LORENT</span><strong>01</strong><small>COLEÇÃO</small></div>}
          <div className="hero-product-meta">
            <span>COLEÇÃO LORENT</span>
            <span>{catalogProducts.length.toString().padStart(2, '0')} MODELOS</span>
          </div>
        </div>
      </section>

      <section className="brand-strip" aria-label="Destaques Lorent">
        <span>Design de presença</span>
        <span className="brand-dot">◆</span>
        <span>Seleção Lorent</span>
        <span className="brand-dot">◆</span>
        <span>Atendimento personalizado</span>
      </section>

      <section id="colecao" className="catalog">
        <div className="catalog-head">
          <div>
            <p className="eyebrow">COLEÇÃO COMPLETA</p>
            <h2>Todos os relógios</h2>
          </div>
          <p className="catalog-count">{visible.length} modelos</p>
        </div>

        <div className="catalog-toolbar">
          <p>Encontre o modelo que combina com a sua história.</p>
          <label className="search">
            <span>Buscar</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome ou modelo"/>
          </label>
        </div>

        <div className="product-grid">
          {visible.map(product => (
            <article className="product-card" key={product.id}>
              <Link href={'/produto/' + product.id} className="product-media" aria-label={'Abrir ' + product.name}>
                {product.imageUrl
                  ? <img className="product-photo" src={product.imageUrl} alt={product.name}/>
                  : <div className="product-fallback"><span>LORENT</span><strong>{product.name.slice(-2)}</strong></div>}
                <span className="product-view">Ver produto</span>
              </Link>
              <div className="product-info">
                <div className="product-copy">
                  <Link href={'/produto/' + product.id} className="product-name">{product.name}</Link>
                  <p className="product-subtitle">Relógio Lorent</p>
                  <p className={'product-price' + (product.priceInCents === null ? ' unavailable' : '')}>
                    {product.priceInCents === null ? 'Preço em definição' : money.format(product.priceInCents / 100)}
                  </p>
                </div>
                <button
                  className="add-button"
                  disabled={product.priceInCents === null}
                  onClick={() => {
                    setCart(current => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
                    setNotice(product.name + ' adicionado à sacola.');
                  }}
                >
                  Adicionar
                </button>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && <div className="empty-state">Nenhum modelo encontrado.</div>}
      </section>

      <section id="sobre" className="about">
        <p className="eyebrow">A CASA LORENT</p>
        <div className="about-grid">
          <h2>O tempo também<br/><i>é uma assinatura.</i></h2>
          <p>A Lorent nasce da atenção aos detalhes. Uma seleção pensada para transformar cada escolha em algo pessoal, duradouro e memorável.</p>
        </div>
      </section>

      <section id="pedido" className="order-section">
        <div className="order-intro">
          <p className="eyebrow">SUA SACOLA</p>
          <h2>Finalize sua escolha.</h2>
          <p>Revise seus modelos e siga para o checkout quando estiver pronto.</p>
        </div>
        <div className="order-box">
          {count === 0
            ? <div className="empty-cart"><strong>Sua sacola está vazia.</strong><p>Adicione um modelo da coleção para continuar.</p></div>
            : <>
                {catalogProducts.filter(product => cart[product.id]).map(product => (
                  <div className="order-line" key={product.id}>
                    <div><strong>{product.name}</strong><span>Quantidade: {cart[product.id]}</span></div>
                    <span className="order-price">{product.priceInCents === null ? '' : money.format(product.priceInCents * cart[product.id] / 100)}</span>
                    <button onClick={() => setCart(current => {
                      const next = { ...current };
                      delete next[product.id];
                      return next;
                    })}>Remover</button>
                  </div>
                ))}
                <form className="order-form" onSubmit={checkout}>
                  <label>Seu nome<input required name="name" placeholder="Nome completo"/></label>
                  <label>E-mail<input required name="email" type="email" placeholder="voce@email.com"/></label>
                  <label>Telefone (opcional)<input name="phone" placeholder="(00) 00000-0000"/></label>
                  <button className="button primary-button" type="submit">Continuar para pagamento <span>→</span></button>
                </form>
              </>}
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
