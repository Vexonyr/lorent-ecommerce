'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProductRow = { id: string; name: string; priceInCents: number | null; imageUrl: string | null; stock: { quantity: number } | null };

export function ProductEditor({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  async function save(event: React.FormEvent<HTMLFormElement>, product: ProductRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawPrice = String(form.get('price') || '').trim();
    const rawImage = String(form.get('imageUrl') || '').trim();
    const rawQuantity = String(form.get('quantity') || '').trim();
    const payload: Record<string, string | number | null> = {
      productId: product.id,
      priceInCents: rawPrice ? Math.round(Number(rawPrice.replace(',', '.')) * 100) : null,
      imageUrl: rawImage || null,
    };
    if (rawQuantity) payload.quantity = Number(rawQuantity);
    setSaving(product.id);
    setMessage('');
    const response = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    setSaving(null);
    if (!response.ok) { setMessage(result.error || 'Não foi possível salvar.'); return; }
    setMessage(product.name + ' atualizado.');
    router.refresh();
  }

  return <div className="admin-product-grid">{products.map(product => <form className="admin-product" key={product.id} onSubmit={event => save(event, product)}>
    <div className="admin-product-heading"><strong>{product.name}</strong><span>{product.id}</span></div>
    <label>Preço (R$)<input name="price" type="number" min="0.01" step="0.01" defaultValue={product.priceInCents === null ? '' : (product.priceInCents / 100).toFixed(2)} placeholder="Definir depois"/></label>
    <label>Foto do produto · link da imagem<input name="imageUrl" type="url" defaultValue={product.imageUrl || ''} placeholder="https://…"/></label>
    <label>Estoque (opcional)<input name="quantity" type="number" min="0" step="1" defaultValue={product.stock?.quantity ?? ''} placeholder="Sem controle por enquanto"/></label>
    <button className="button" type="submit" disabled={saving === product.id}>{saving === product.id ? 'Salvando…' : 'Salvar modelo'}</button>
  </form>)}</div>;
}
