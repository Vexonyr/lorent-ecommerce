'use client';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || 'Não foi possível entrar.');
        return;
      }
      router.refresh();
    } catch {
      setMessage('Não foi possível conectar. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return <form className="admin-product" onSubmit={login}>
    <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
    <label>Senha<input name="password" type="password" autoComplete="current-password" maxLength={256} required /></label>
    <button className="button" type="submit" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
    {message && <p role="alert">{message}</p>}
  </form>;
}
