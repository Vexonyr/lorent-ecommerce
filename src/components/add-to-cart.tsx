'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/cart-provider';
import { MAX_CART_PRODUCTS, MAX_CART_QUANTITY } from '@/lib/cart';

export function AddToCart({ productId, name, stock, detail = false }: { productId: string; name: string; stock: number | null; detail?: boolean }) {
  const { items, update, ready } = useCart();
  const [notice, setNotice] = useState('');
  const current = items.find(item => item.productId === productId);
  const limit = Math.min(stock ?? MAX_CART_QUANTITY, MAX_CART_QUANTITY);
  const unavailable = limit <= (current?.quantity ?? 0);

  function add() {
    if (!ready || unavailable) return;
    if (!current && items.length >= MAX_CART_PRODUCTS) { setNotice('Sua sacola atingiu o limite de modelos.'); return; }
    update(current ? items.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1, selected: true } : item) : [...items, { productId, quantity: 1, selected: true }]);
    setNotice(`${name} adicionado à sacola.`);
  }

  return <div className={detail ? 'detail-cart-action' : 'product-cart-action'}>
    <button className={detail ? 'shop-button shop-button-dark' : 'add-to-bag'} type="button" onClick={add} disabled={!ready || unavailable}>{stock === 0 ? 'Esgotado' : unavailable ? 'Limite na sacola' : 'Adicionar à sacola'}</button>
    {notice && <p className="notice" role="status">{notice} {detail && <Link href="/#pedido">Ver sacola</Link>}</p>}
  </div>;
}
