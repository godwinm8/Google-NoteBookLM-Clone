import { NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

export default function middleware(req) {
  const url = new URL(req.url);
  // collapse any // into / in pathname
  const cleanPath = url.pathname.replace(/\/{2,}/g, "/");
  if (cleanPath !== url.pathname) {
    url.pathname = cleanPath;
    // internal rewrite (no 301/302)
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
