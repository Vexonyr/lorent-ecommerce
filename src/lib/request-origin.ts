export function isStoreOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const configured = process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://lorent-ecommerce-xdgr.vercel.app' : undefined);
  const requestUrl = new URL(request.url);
  const expected = configured ? new URL(configured).origin : `${requestUrl.protocol}//${request.headers.get('host') || requestUrl.host}`;
  return origin === expected;
}
