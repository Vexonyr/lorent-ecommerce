'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { mergeCart, parseCart, type CartEntry } from '@/lib/cart';

type CartContextValue = { items: CartEntry[]; ready: boolean; notice: string; update: (items: CartEntry[]) => void };
const CartContext = createContext<CartContextValue | null>(null);
const keyFor = (customerId?: string) => `lorent-cart:v1:${customerId ?? 'guest'}`;

function readCart(key: string) {
  try { return parseCart(JSON.parse(localStorage.getItem(key) ?? '[]')); } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const customerId = session?.user.id;
  const key = keyFor(customerId);
  const [state, setState] = useState<{ key: string; items: CartEntry[] }>({ key: '', items: [] });
  const [notice, setNotice] = useState('');
  const activeKey = useRef(key);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    activeKey.current = key;
    async function initialize() {
      await Promise.resolve();
      let items = readCart(key);
      let warning = '';
      if (customerId) {
        try {
          const response = await fetch('/api/cart', { cache: 'no-store' });
          if (!response.ok) throw new Error('load');
          const remote = await response.json();
          const guest = readCart(keyFor());
          const unsaved = localStorage.getItem(key + ':pending') === '1';
          items = mergeCart(unsaved ? items : parseCart(remote.items), guest);
          if (cancelled) return;
          if (guest.length || unsaved) {
            const saved = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, items }) });
            if (!saved.ok) throw new Error('save');
            localStorage.removeItem(keyFor());
            localStorage.removeItem(key + ':pending');
          }
        } catch { warning = 'Não foi possível sincronizar a sacola. Os itens deste navegador foram mantidos.'; }
      }
      if (cancelled) return;
      try { localStorage.setItem(key, JSON.stringify(items)); } catch { warning = 'Este navegador não permite guardar a sacola. Mantenha a página aberta.'; }
      setState({ key, items });
      setNotice(warning);
    }
    void initialize();
    function storageChanged(event: StorageEvent) {
      if (event.key === key) setState({ key, items: readCart(key) });
    }
    window.addEventListener('storage', storageChanged);
    return () => { cancelled = true; window.removeEventListener('storage', storageChanged); };
  }, [key, customerId, isPending]);

  function update(value: CartEntry[]) {
    if (isPending || state.key !== key) return;
    const items = parseCart(value);
    setState({ key, items });
    setNotice('');
    const serialized = JSON.stringify(items);
    try { localStorage.setItem(key, serialized); if (customerId) localStorage.setItem(key + ':pending', '1'); } catch { setNotice('A sacola não pôde ser salva neste navegador.'); }
    if (!customerId) return;
    saveQueue.current = saveQueue.current.catch(() => undefined).then(async () => {
      if (activeKey.current !== key) return;
      try {
        const response = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, items }) });
        if (!response.ok) throw new Error('save');
        if (localStorage.getItem(key) === serialized) localStorage.removeItem(key + ':pending');
      } catch {
        if (activeKey.current === key) setNotice('A sacola está salva neste navegador, mas não foi possível sincronizá-la com sua conta.');
      }
    });
  }

  return <CartContext.Provider value={{ items: state.key === key ? state.items : [], ready: !isPending && state.key === key, notice, update }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartProvider is required');
  return context;
}
