import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/modules/auth/server/auth-client';
import {
  ABSOLUTE_ROUTES,
  AUTH_REQUIRED_PREFIXES,
  ADMIN_ONLY_PREFIX,
  VENDOR_ONLY_PREFIX,
} from '@/modules/core/constants/absolute-routes';
import { USER_ROLES } from './modules/core/constants/user-roles';

function pathRequiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function pathRequiresAdmin(pathname: string): boolean {
  return (
    pathname === ADMIN_ONLY_PREFIX ||
    pathname.startsWith(`${ADMIN_ONLY_PREFIX}/`)
  );
}

function pathRequiresVendor(pathname: string): boolean {
  return (
    pathname === VENDOR_ONLY_PREFIX ||
    pathname.startsWith(`${VENDOR_ONLY_PREFIX}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathRequiresAuth(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const authUrl = new URL(ABSOLUTE_ROUTES.AUTH, request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  if (pathRequiresAdmin(pathname)) {
    const role = session.user.role;
    if (role !== USER_ROLES.ADMIN) {
      return NextResponse.redirect(new URL(ABSOLUTE_ROUTES.ROOT, request.url));
    }
  }

  if (pathRequiresVendor(pathname)) {
    const role = session.user.role;
    if (role !== USER_ROLES.VENDOR) {
      return NextResponse.redirect(new URL(ABSOLUTE_ROUTES.ROOT, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/admin/:path*', '/vendor/:path*', '/profile/:path*'],
};
