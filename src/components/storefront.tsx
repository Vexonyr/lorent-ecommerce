'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CatalogProduct } from '@/lib/products';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function Storefront({ stage, catalogProducts }: { stage: number; catalogProducts: CatalogProduct[] }) {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState('');
  const visible = useMemo(() => catalogProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [catalogProducts, query]);
  const count = Object.values(cart).reduce((sum, n) => sum + n, 0);
  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setNotice('Conectando ao checkout seguro…');
    const response = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      customerName: fields.get('name'), customerEmail: fields.get('email'), customerPhone: fields.get('phone') || undefined,
      items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
    }) });
    const result = await response.json();
    if (response.ok && result.checkoutUrl) window.location.assign(result.checkoutUrl);
    else setNotice(result.error || 'Não foi possível iniciar o checkout.');
  }
  return <>
    <header className="topbar"><Link className="wordmark" href="/">LORENT<span>®</span></Link><nav><a href="#colecao">Coleção</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav><a className="cart-link" href="#pedido">Pedido <b>{count}</b></a></header>
    <main>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">HOROLOGIA · EDIÇÃO LORENT</p><h1>Precisão que atravessa<br/><i>o tempo.</i></h1><p className="intro">Uma coleção concebida para quem reconhece valor nos detalhes, na presença e no tempo.</p><a className="button" href="#colecao">Descobrir a coleção <span>↗</span></a><p className="small-note">Seleção exclusiva · atendimento personalizado</p></div><div className="hero-visual" aria-label="Seleção de modelos Lorent"><div className="hero-identity"><span>LORENT</span><strong>MODELOS 01 — 23</strong></div><span className="image-caption">COLEÇÃO LORENT</span></div><div className="hero-index">01 <span>—</span> 23</div></section>
      <section id="colecao" className="catalog"><div className="section-heading"><div><p className="eyebrow">COLEÇÃO · LORENT</p><h2>Escolha o que<br/><i>permanece.</i></h2><p className="muted">Uma curadoria de peças selecionadas para diferentes estilos, ocasiões e histórias.</p></div><label className="search">Buscar modelo<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: Modelo 03"/></label></div>
        <div className="product-grid">{visible.map(p => <article className="product-card" key={p.id}><Link href={'/produto/'+p.id} className="product-placeholder" aria-label={'Abrir '+p.name}>{p.imageUrl ? <img className="product-photo" src={p.imageUrl} alt={p.name}/> : <><span className="product-number">{p.name.slice(-2)}</span><span className="placeholder-label">LORENT · MODELO</span></>}</Link><div className="product-info"><div><p className="product-name">{p.name}</p><p className="muted">{p.priceInCents === null ? 'Preço em definição' : money.format(p.priceInCents/100)}</p></div><button className="add-button" disabled={p.priceInCents === null} onClick={() => { setCart(c => ({...c,[p.id]:(c[p.id]||0)+1})); setNotice(p.name+' adicionado ao pedido.'); }} aria-label={'Adicionar '+p.name}>＋</button></div></article>)}</div>{visible.length === 0 && <p className="muted">Nenhum modelo encontrado.</p>}
      </section>
      <section id="pedido" className="order-section"><div><p className="eyebrow">ATENDIMENTO · LORENT</p><h2>Sua escolha,<br/><i>com cuidado.</i></h2><p className="muted">Selecione seus modelos. A experiência de compra foi pensada para ser simples, segura e pessoal.</p></div><div className="order-box">{count === 0 ? <p className="muted">Seu pedido ainda está vazio. Adicione modelos com preço cadastrado.</p> : <>{catalogProducts.filter(p => cart[p.id]).map(p => <div className="order-line" key={p.id}><span>{p.name} × {cart[p.id]}</span><span>{p.priceInCents === null ? '' : money.format(p.priceInCents*cart[p.id]/100)}</span><button onClick={() => setCart(c => { const n={...c}; delete n[p.id]; return n; })}>Remover</button></div>)}<form className="order-form" onSubmit={checkout}><label>Seu nome<input required name="name" placeholder="Como podemos chamar você?"/></label><label>E-mail<input required name="email" type="email" placeholder="Seu e-mail"/></label><label>Telefone (opcional)<input name="phone" placeholder="Seu telefone"/></label><button className="button" type="submit">Ir para pagamento <span>↗</span></button></form></>}{notice && <p className="notice" role="status">{notice}</p>}</div></section>
      <section id="sobre" className="about"><p className="eyebrow">A CASA LORENT</p><h2>Mais que um objeto.<br/><i>Uma assinatura.</i></h2><p>A Lorent nasce da atenção aos detalhes. Uma seleção pensada para transformar cada escolha em algo pessoal, duradouro e memorável.</p></section>
    </main><footer id="contato"><Link className="wordmark" href="/">LORENT<span>®</span></Link><p>Curadoria, presença e precisão.</p><span>© LORENT</span></footer>
  </>;
}
