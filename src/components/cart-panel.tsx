'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useCart } from '@/components/cart-provider';
import { cartTotals, MAX_CART_QUANTITY } from '@/lib/cart';
import type { CatalogProduct } from '@/lib/products';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function CartPanel({ products }: { products: CatalogProduct[] }) {
  const { items, ready, notice: syncNotice, update } = useCart();
  const { data: session } = authClient.useSession();
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const totals = cartTotals(items, products);
  const catalog = new Map(products.map(product => [product.id, product]));
  const selectedCount = items.filter(item => item.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!totals.canCheckout || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setNotice('Conferindo os produtos selecionados…');
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: session?.user.name ?? fields.get('name'), customerEmail: session?.user.email ?? fields.get('email'), customerPhone: fields.get('phone') || undefined, items: totals.eligible.map(({ productId, quantity }) => ({ productId, quantity })) }),
      });
      const result = await response.json();
      if (response.ok && result.checkoutUrl) {
        const target = new URL(result.checkoutUrl);
        if (target.protocol !== 'https:' || !(target.hostname === 'mercadopago.com.br' || target.hostname.endsWith('.mercadopago.com.br'))) throw new Error('checkout');
        window.location.assign(target.href);
      } else setNotice(result.error || 'Não foi possível iniciar o pagamento.');
    } catch { setNotice('Não foi possível conectar ao pagamento. Sua sacola foi mantida.'); }
    finally { setPending(false); submitting.current = false; }
  }

  return <div className="cart-panel" aria-busy={!ready || pending}>
    {!ready ? <p role="status">Carregando sua sacola…</p> : items.length === 0 ? <div className="empty-cart">
      <strong>Sua sacola está vazia.</strong><p>Adicione um relógio para começar seu pedido.</p><a className="shop-button shop-button-dark" href="#colecao">Ver produtos</a>
    </div> : <>
      <div className="cart-selection-bar"><label><input type="checkbox" checked={allSelected} disabled={pending} onChange={event => update(items.map(item => ({ ...item, selected: event.target.checked })))} /> Selecionar todos</label><span>{selectedCount} de {items.length} modelos selecionados</span></div>
      <ul className="cart-items cart-item-list">{items.map(item => {
        const product = catalog.get(item.productId);
        const limit = Math.min(product?.stock?.quantity ?? MAX_CART_QUANTITY, MAX_CART_QUANTITY);
        const unavailable = !product || (product.stock && product.stock.quantity < item.quantity);
        return <li className={'cart-product-row' + (item.selected ? ' is-selected' : '')} key={item.productId}>
          <input className="cart-select" type="checkbox" aria-label={`Comprar ${product?.name ?? item.productId}`} checked={item.selected} disabled={pending} onChange={event => update(items.map(entry => entry.productId === item.productId ? { ...entry, selected: event.target.checked } : entry))} />
          <Link href={'/produto/' + item.productId} className="cart-product-image" aria-label={`Ver ${product?.name ?? item.productId}`}><img src={product?.imageUrl || '/catalogo/placeholder-white.svg'} alt={product?.imageUrl ? product.name : ''} /></Link>
          <div className="cart-product-info">
            <Link href={'/produto/' + item.productId}>{product?.name ?? 'Produto indisponível'}</Link>
            <span>{product?.priceInCents ? `${money.format(product.priceInCents / 100)} por unidade` : 'Preço em definição'}</span>
            {unavailable && <p className="account-error">{product ? 'Quantidade indisponível. Ajuste a sacola.' : 'Este modelo não está mais disponível.'}</p>}
            <div className="cart-quantity" role="group" aria-label={`Quantidade de ${product?.name ?? item.productId}`}>
              <button type="button" aria-label={`Diminuir quantidade de ${product?.name ?? item.productId}`} disabled={pending || item.quantity === 1} onClick={() => update(items.map(entry => entry.productId === item.productId ? { ...entry, quantity: entry.quantity - 1 } : entry))}>−</button>
              <span aria-live="polite">{item.quantity}</span>
              <button type="button" aria-label={`Aumentar quantidade de ${product?.name ?? item.productId}`} disabled={pending || item.quantity >= limit} onClick={() => update(items.map(entry => entry.productId === item.productId ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button>
            </div>
          </div>
          <div className="cart-product-end"><strong>{product?.priceInCents ? money.format(product.priceInCents * item.quantity / 100) : 'A definir'}</strong><button type="button" className="cart-remove" disabled={pending} aria-label={`Remover ${product?.name ?? item.productId}`} onClick={() => update(items.filter(entry => entry.productId !== item.productId))}>Remover</button></div>
        </li>;
      })}</ul>
      <div className="cart-summary" aria-live="polite">
        <div><span>Total da sacola</span><strong>{totals.allTotal === null ? 'A definir' : money.format(totals.allTotal / 100)}</strong></div>
        <div><span>Unidades selecionadas</span><strong>{totals.selectedQuantity}</strong></div>
        <div className="cart-total"><span>Total selecionado</span><strong>{totals.selectedTotal === null ? 'A definir' : money.format(totals.selectedTotal / 100)}</strong></div>
      </div>
      <p className="cart-help">Somente os produtos marcados serão enviados para o pagamento.</p>
      {totals.selectedTotal === null && <p className="cart-help">Há itens selecionados com preço em definição ou quantidade indisponível. Você pode mantê-los na sacola e desmarcá-los para comprar os demais.</p>}
      <form className="checkout-form" key={session?.user.id ?? 'guest'} onSubmit={checkout}>
        <h3>Dados para continuar</h3>
        {session ? <p>Pedido de {session.user.name} · {session.user.email}</p> : <p><Link href="/entrar">Entre</Link> ou <Link href="/cadastro">crie uma conta</Link> para acompanhar este pedido.</p>}
        {!session && <><label>Nome completo<input required name="name" autoComplete="name" minLength={2} maxLength={120} placeholder="Seu nome" /></label><label>E-mail<input required name="email" type="email" autoComplete="email" maxLength={254} placeholder="voce@email.com" /></label></>}
        <label>Telefone (opcional)<input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="(00) 00000-0000" /></label>
        <button className="shop-button shop-button-dark checkout-button" type="submit" disabled={pending || !totals.canCheckout}>{pending ? 'Aguarde…' : 'Comprar selecionados'}</button>
      </form>
    </>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {syncNotice && <p className="notice" role="status">{syncNotice}</p>}
  </div>;
}
