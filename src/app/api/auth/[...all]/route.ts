import { toNextJsHandler } from 'better-auth/next-js';
import { customerAuth } from '@/lib/customer-auth';

export const runtime = 'nodejs';
export const { GET, POST } = toNextJsHandler(customerAuth);
