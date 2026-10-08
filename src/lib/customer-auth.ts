import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { prisma } from '@/lib/prisma';

export const customerAuth = betterAuth({
  appName: 'Lorent',
  baseURL: process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://lorent-ecommerce-xdgr.vercel.app' : 'http://localhost:3000'),
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'postgresql', transaction: true }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 3 },
      '/change-password': { window: 60, max: 3 },
    },
  },
  advanced: { cookiePrefix: 'lorent_customer' },
  databaseHooks: {
    user: {
      create: {
        before: async user => {
          const name = user.name.trim();
          if (name.length < 2 || name.length > 120 || user.email.length > 254) throw new APIError('BAD_REQUEST', { message: 'Nome ou e-mail inválido.' });
          return { data: { ...user, name } };
        },
      },
      update: {
        before: async user => {
          if (user.name !== undefined && (user.name.trim().length < 2 || user.name.trim().length > 120)) throw new APIError('BAD_REQUEST', { message: 'Nome inválido.' });
          return { data: { ...user, ...(user.name !== undefined ? { name: user.name.trim() } : {}) } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export async function currentCustomer() {
  return customerAuth.api.getSession({ headers: await headers() });
}
