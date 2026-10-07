import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart-provider';
export const metadata: Metadata = { title: 'Lorent — Relógios', description: 'Conheça os modelos do catálogo Lorent.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><CartProvider>{children}</CartProvider></body></html>; }
