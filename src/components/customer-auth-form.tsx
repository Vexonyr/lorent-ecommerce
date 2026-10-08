'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

function errorMessage(code?: string, status?: number) {
  if (status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.';
  if (code === 'INVALID_EMAIL') return 'Informe um e-mail válido.';
  if (code === 'PASSWORD_TOO_SHORT') return 'Use uma senha com pelo menos 12 caracteres.';
  if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') return 'Não foi possível criar a conta. Se já possui cadastro, entre com seu e-mail e senha.';
  return 'Não foi possível continuar. Confira os dados e tente novamente.';
}

export function CustomerAuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const registering = mode === 'register';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get('email') || '').trim().toLowerCase();
    const password = String(fields.get('password') || '');
    if (registering && password !== fields.get('confirmPassword')) {
      setError('As senhas precisam ser iguais.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = registering
        ? await authClient.signUp.email({ name: String(fields.get('name') || '').trim(), email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.status >= 500 ? 'O acesso à conta está temporariamente indisponível. Tente novamente.' : registering ? errorMessage(result.error.code, result.error.status) : result.error.status === 429 ? errorMessage(undefined, 429) : 'E-mail ou senha incorretos.');
        return;
      }
      router.replace('/minha-conta');
      router.refresh();
    } catch {
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return <div className="account-card">
    <p className="eyebrow">SUA CONTA LORENT</p>
    <h1>{registering ? 'Criar conta' : 'Bem-vindo de volta.'}</h1>
    <p>{registering ? 'Cadastre-se para acompanhar seus próximos pedidos.' : 'Entre para acessar sua conta e acompanhar seus pedidos.'}</p>
    <form className="account-form" onSubmit={submit}>
      {registering && <label>Nome completo<input name="name" autoComplete="name" required minLength={2} maxLength={120} /></label>}
      <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Senha<input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 12 : undefined} maxLength={128} aria-describedby={registering ? 'password-help' : undefined} /></label>
      {registering && <>
        <p id="password-help" className="account-help">Use pelo menos 12 caracteres.</p>
        <label>Confirmar senha<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
      </>}
      {error && <p className="account-error" role="alert">{error}</p>}
      <button className="shop-button shop-button-dark" disabled={pending} type="submit">{pending ? 'Aguarde…' : registering ? 'Criar minha conta' : 'Entrar'}</button>
    </form>
    <p className="account-switch">{registering ? 'Já tem uma conta? ' : 'Ainda não tem uma conta? '}<Link href={registering ? '/entrar' : '/cadastro'}>{registering ? 'Entrar' : 'Cadastre-se'}</Link></p>
  </div>;
}
