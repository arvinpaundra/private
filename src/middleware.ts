import { NextResponse, type NextRequest } from 'next/server';
// import { getSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  // const session = await getSession();
  const session = null;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If the user is authenticated
  if (session) {
    // and tries to access login/register, redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Otherwise, allow the request
    return NextResponse.next();
  }

  // If the user is not authenticated
  // and tries to access a protected route, redirect to login
  if (!isAuthRoute && pathname.startsWith('/dashboard')) {
    //  return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to public routes and auth routes
  return NextResponse.next();
}

export const config = {
  // Matcher is cleared to bypass auth
  matcher: [],
};
