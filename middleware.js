// middleware.js
import { NextResponse } from 'next/server'

export function middleware (req) {
  const role = req.cookies.get('role')?.value
  const { pathname } = req.nextUrl

  // If not logged in → redirect to login
  if (pathname.startsWith('/user') || pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/Login', req.url))
  }

  // If non-admin tries to access /admin → redirect
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/user/UserDashboard', req.url))
  }

  // Optional: If admin tries to access /user routes → redirect them
  // if (pathname.startsWith('/user') && role === 'admin') {
  //   return NextResponse.redirect(new URL('/admin/AdminDashboard', req.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/user/:path*', '/admin/:path*'] // protect these routes
}
