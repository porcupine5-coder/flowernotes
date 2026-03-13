import { NextRequest, NextResponse } from 'next/server';

// Basic in-memory rate limiting per IP (per server instance). For production, use a distributed store.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 80;

const rateLimitStore = new Map<string, { count: number; start: number }>();

function getRateLimitData(ip: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);
  if (!existing || now - existing.start > RATE_LIMIT_WINDOW_MS) {
    const entry = { count: 1, start: now };
    rateLimitStore.set(ip, entry);
    return entry;
  }
  existing.count += 1;
  return existing;
}

export function middleware(request: NextRequest) {
  // HTTPS redirection for non-local requests
  if (request.nextUrl.protocol === 'http') {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = 'https';
    return NextResponse.redirect(secureUrl, 301);
  }

  const ip = (request as any).ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rateData = getRateLimitData(ip);

  if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
