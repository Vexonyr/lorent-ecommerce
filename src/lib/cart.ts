import type { CatalogProduct } from './products';

export type CartEntry = { productId: string; quantity: number; selected: boolean };
export const MAX_CART_QUANTITY = 20;
export const MAX_CART_PRODUCTS = 30;

export function parseCart(value: unknown): CartEntry[] {
  if (!Array.isArray(value)) return [];
  const entries = new Map<string, CartEntry>();
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const { productId, quantity, selected } = entry;
    if (typeof productId !== 'string' || !productId || productId.length > 200 || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_QUANTITY) continue;
    entries.set(productId, { productId, quantity, selected: selected !== false });
    if (entries.size >= MAX_CART_PRODUCTS) break;
  }
  return [...entries.values()];
}

export function mergeCart(saved: CartEntry[], guest: CartEntry[]): CartEntry[] {
  const entries = new Map(saved.map(entry => [entry.productId, entry]));
  for (const entry of guest) {
    const existing = entries.get(entry.productId);
    entries.set(entry.productId, { ...entry, quantity: Math.max(existing?.quantity ?? 0, entry.quantity) });
  }
  return [...entries.values()].slice(0, MAX_CART_PRODUCTS);
}

export function cartTotals(entries: CartEntry[], products: CatalogProduct[]) {
  const catalog = new Map(products.map(product => [product.id, product]));
  let allTotal = 0, selectedTotal = 0, selectedQuantity = 0, allPricesKnown = true, selectedPricesKnown = true;
  const eligible: CartEntry[] = [];
  for (const entry of entries) {
    const product = catalog.get(entry.productId);
    const priceKnown = !!product && product.priceInCents !== null && product.priceInCents > 0;
    if (!priceKnown) allPricesKnown = false;
    else allTotal += product!.priceInCents! * entry.quantity;
    if (!entry.selected) continue;
    selectedQuantity += entry.quantity;
    if (!priceKnown || (product!.stock && product!.stock.quantity < entry.quantity)) selectedPricesKnown = false;
    else { selectedTotal += product!.priceInCents! * entry.quantity; eligible.push(entry); }
  }
  return { allTotal: allPricesKnown ? allTotal : null, selectedTotal: selectedPricesKnown ? selectedTotal : null, selectedQuantity, eligible, canCheckout: selectedQuantity > 0 && selectedPricesKnown };
}

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function searchProducts(products: CatalogProduct[], query: string) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return products.filter(product => {
    const haystack = normalizeSearch(`${product.name} ${product.id} ${product.description ?? ''} Lorent relógio`);
    return terms.every(term => haystack.includes(term));
  });
}
