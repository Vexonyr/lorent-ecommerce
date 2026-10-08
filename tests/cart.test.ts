import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cartTotals, mergeCart, parseCart, searchProducts } from '../src/lib/cart';
import type { CatalogProduct } from '../src/lib/products';

const products: CatalogProduct[] = [
  { id: 'modelo-01', name: 'Modelo 01', description: 'Relógio aço dourado', imageUrl: null, priceInCents: 12990, stock: { quantity: 5 } },
  { id: 'modelo-02', name: 'Modelo 02', description: 'Pulseira preta', imageUrl: null, priceInCents: 25995, stock: null },
  { id: 'modelo-03', name: 'Modelo 03', description: null, imageUrl: null, priceInCents: null, stock: null },
];

test('soma valores em centavos e envia apenas os modelos selecionados', () => {
  const totals = cartTotals([{ productId: 'modelo-01', quantity: 2, selected: true }, { productId: 'modelo-02', quantity: 3, selected: false }], products);
  assert.equal(totals.allTotal, 103965);
  assert.equal(totals.selectedTotal, 25980);
  assert.equal(totals.selectedQuantity, 2);
  assert.deepEqual(totals.eligible.map(item => item.productId), ['modelo-01']);
  assert.equal(totals.canCheckout, true);
});

test('não trata preço indefinido como gratuito nem bloqueia outro item desmarcado', () => {
  const items = [{ productId: 'modelo-01', quantity: 1, selected: true }, { productId: 'modelo-03', quantity: 1, selected: true }];
  assert.equal(cartTotals(items, products).selectedTotal, null);
  assert.equal(cartTotals(items, products).canCheckout, false);
  items[1].selected = false;
  assert.equal(cartTotals(items, products).selectedTotal, 12990);
  assert.equal(cartTotals(items, products).allTotal, null);
  assert.equal(cartTotals(items, products).canCheckout, true);
});

test('não permite comprar quantidade superior ao estoque nem produto removido', () => {
  assert.equal(cartTotals([{ productId: 'modelo-01', quantity: 6, selected: true }], products).canCheckout, false);
  assert.equal(cartTotals([{ productId: 'removido', quantity: 1, selected: true }], products).canCheckout, false);
});

test('sem seleção não existe checkout', () => {
  const totals = cartTotals([{ productId: 'modelo-01', quantity: 1, selected: false }], products);
  assert.equal(totals.selectedTotal, 0);
  assert.equal(totals.canCheckout, false);
});

test('busca ignora acentos, capitalização, espaços e hífens', () => {
  assert.deepEqual(searchProducts(products, '  RELOGIO aco DOURADO ').map(product => product.id), ['modelo-01']);
  assert.deepEqual(searchProducts(products, 'modelo-02').map(product => product.id), ['modelo-02']);
  assert.deepEqual(searchProducts(products, 'preta modelo').map(product => product.id), ['modelo-02']);
  assert.equal(searchProducts(products, 'inexistente').length, 0);
});

test('conteúdo inválido do navegador não entra na sacola', () => {
  assert.deepEqual(parseCart({}), []);
  assert.deepEqual(parseCart([{ productId: 'modelo-01', quantity: -2 }, { productId: 'modelo-02', quantity: 21 }, { productId: 'modelo-03', quantity: 1.5 }]), []);
});

test('incorpora a sacola de visitante sem duplicar a mesma quantidade em logins repetidos', () => {
  const saved = [{ productId: 'modelo-01', quantity: 2, selected: false }];
  const guest = [{ productId: 'modelo-01', quantity: 3, selected: true }, { productId: 'modelo-02', quantity: 1, selected: false }];
  const merged = mergeCart(saved, guest);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].quantity, 3);
  assert.deepEqual(mergeCart(merged, guest), merged);
});
