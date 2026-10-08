import { redirect } from 'next/navigation';
import { currentCustomer } from '@/lib/customer-auth';
import { AccountHeader } from '@/components/account-header';
import { CustomerAuthForm } from '@/components/customer-auth-form';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  if (await currentCustomer()) redirect('/minha-conta');
  return <><AccountHeader /><main className="account-main"><CustomerAuthForm mode="register" /></main></>;
}
