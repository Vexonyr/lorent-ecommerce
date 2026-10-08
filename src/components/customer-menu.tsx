'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function CustomerMenu() {
  const { data: session, isPending } = authClient.useSession();
  return <Link href={session ? '/minha-conta' : '/entrar'} aria-busy={isPending}>{session ? 'Minha conta' : 'Entrar'}</Link>;
}
