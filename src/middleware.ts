import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// /admin 配下を保護する。未認証は /admin/login へ、認証済みで /admin/login は /admin へ。
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() は毎回 Auth サーバー往復。getClaims() は非対称鍵ならローカル検証で速い
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const email =
    typeof claims?.email === "string" ? claims.email : undefined;
  const authenticated = Boolean(claims?.sub);

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!authenticated && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (authenticated && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (email) {
    requestHeaders.set("x-admin-email", email);
  }

  // ヘッダ更新を確実に反映しつつ、setAll で付いた cookie を引き継ぐ
  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie);
  });
  return finalResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
