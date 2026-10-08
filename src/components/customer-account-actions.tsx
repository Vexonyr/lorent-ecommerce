'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function CustomerAccountActions() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');

  async function logout() {
    setPending(true);
    setNotice('');
    try {
      const result = await authClient.signOut();
      if (result.error) { setNotice('Não foi possível sair. Tente novamente.'); return; }
      router.replace('/entrar');
      router.refresh();
    } catch { setNotice('Não foi possível conectar. Tente novamente.'); }
    finally { setPending(false); }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (fields.get('newPassword') !== fields.get('confirmPassword')) { setNotice('As novas senhas precisam ser iguais.'); return; }
    setPending(true);
    setNotice('');
    try {
      const result = await authClient.changePassword({ currentPassword: String(fields.get('currentPassword')), newPassword: String(fields.get('newPassword')), revokeOtherSessions: true });
      if (result.error) { setNotice(result.error.status === 429 ? 'Muitas tentativas. Aguarde um minuto.' : 'Não foi possível alterar a senha. Confira sua senha atual.'); return; }
      form.reset();
      setNotice('Senha alterada. As outras sessões foram encerradas.');
    } catch { setNotice('Não foi possível conectar. Tente novamente.'); }
    finally { setPending(false); }
  }

  return <section className="account-card account-security">
    <h2>Segurança da conta</h2>
    <form className="account-form" onSubmit={changePassword}>
      <label>Senha atual<input name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></label>
      <label>Nova senha<input name="newPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} aria-describedby="new-password-help" /></label>
      <p id="new-password-help" className="account-help">Use pelo menos 12 caracteres.</p>
      <label>Confirmar nova senha<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
      <button className="shop-button shop-button-dark" disabled={pending}>Alterar senha</button>
    </form>
    {notice && <p role="status" className="notice">{notice}</p>}
    <button className="account-logout" type="button" disabled={pending} onClick={logout}>Sair da conta</button>
  </section>;
}
