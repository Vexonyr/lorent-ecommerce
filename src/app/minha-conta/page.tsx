import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentCustomer } from '@/lib/customer-auth';
import { prisma } from '@/lib/prisma';
import { AccountHeader } from '@/components/account-header';
import { CustomerAccountActions } from '@/components/customer-account-actions';

export const dynamic = 'force-dynamic';
const statusLabels = { PENDING: 'Pendente', AWAITING_PAYMENT: 'Aguardando pagamento', PAID: 'Pago', PROCESSING: 'Em preparação', SHIPPED: 'Enviado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado' };
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AccountPage() {
  const session = await currentCustomer();
  if (!session) redirect('/entrar');
  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    select: { id: true, status: true, totalInCents: true, createdAt: true, items: { select: { id: true, quantity: true, product: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <><AccountHeader /><main className="customer-account">
    <div className="account-heading"><p className="eyebrow">MINHA CONTA</p><h1>Olá, {session.user.name}.</h1><p>{session.user.email}</p></div>
    <div className="account-grid">
      <section className="account-card account-orders">
        <h2>Meus pedidos</h2>
        {orders.length === 0 ? <div className="empty-cart"><p>Você ainda não tem pedidos nesta conta.</p><Link className="shop-button shop-button-dark" href="/#colecao">Conhecer a coleção</Link></div> : <ul className="account-order-list">{orders.map(order => <li key={order.id}>
          <div className="account-order-heading"><strong>Pedido {order.id}</strong><span>{statusLabels[order.status]}</span></div>
          <p>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(order.createdAt)}</p>
          <ul>{order.items.map(item => <li key={item.id}>{item.quantity} × {item.product.name}</li>)}</ul>
          <strong>{money.format(order.totalInCents / 100)}</strong>
        </li>)}</ul>}
      </section>
      <CustomerAccountActions />
    </div>
  </main></>;
}
