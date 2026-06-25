import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddleware } from "@/lib/supabase";

const PUBLIC_ROUTES = ["/login", "/register"];
const OWNER_ONLY_ROUTES = ["/owner"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transaction",
  "/history",
  "/shift",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddleware(request, response);
  const { data: { user } } = await supabase.auth.getUser();

  if (user && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    OWNER_ONLY_ROUTES.some((prefix) => pathname.startsWith(prefix));

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && OWNER_ONLY_ROUTES.some((p) => pathname.startsWith(p))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "owner") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|workbox-.*\\.js).*)",
  ],
};
