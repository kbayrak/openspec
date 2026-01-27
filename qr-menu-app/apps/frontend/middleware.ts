import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth);
  const isAdminLogin = req.nextUrl.pathname === '/admin';

  if (!isLoggedIn && !isAdminLogin) {
    const url = new URL('/admin', req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
