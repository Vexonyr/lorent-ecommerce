import Link from 'next/link';

export function AccountHeader() {
  return <>
    <div className="announcement-bar">LORENT · COMPRA ONLINE · ATENDIMENTO PERSONALIZADO</div>
    <header className="store-header">
      <Link className="brand-lockup" href="/" aria-label="Lorent - início">
        <img className="brand-mark" src="/brand/lorent-mark.svg" alt="" />
        <span className="brand-name">LORENT<small>®</small></span>
      </Link>
      <nav aria-label="Navegação da conta"><Link href="/#colecao">Relógios</Link></nav>
      <Link className="detail-back" href="/">← Voltar à loja</Link>
    </header>
  </>;
}
