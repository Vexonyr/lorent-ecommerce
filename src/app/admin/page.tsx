import { currentAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LoginForm } from './login-form';
import { ProductEditor } from './product-editor';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const email = await currentAdmin();
  if (!email) return <main className="detail-page"><header className="topbar"><a className="wordmark" href="/">LORENT</a><a href="/">← Loja</a></header><section className="detail-copy" style={{padding:'10vh 10vw'}}><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Acesso Lorent</h1><p className="muted">Entre com a conta administrativa configurada.</p><LoginForm/></section></main>;
  const [products, orders] = await Promise.all([
    prisma.product.findMany({ include: { stock: true }, orderBy: { id: 'asc' } }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);
  return <main className="detail-page"><header className="topbar"><a className="wordmark" href="/">LORENT</a><a href="/">← Loja</a><span>Admin · {email}</span></header><section className="catalog">
    <p className="eyebrow">PAINEL ADMINISTRATIVO</p><h1>Produtos, estoque e pedidos</h1>
    <p className="muted">Preencha o preço e o link da foto quando a Lorent definir esses dados. O estoque é opcional e pode ser ativado quando houver uma quantidade confirmada.</p>
    <ProductEditor products={products}/>
    <h2>Pedidos recentes</h2>{orders.map(order => <p key={order.id}>{order.id} · {order.customerName} · {order.status} · {order.items.length} itens</p>)}
  </section></main>;
}
