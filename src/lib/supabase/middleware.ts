import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Check if the request has any Supabase auth cookies.
 * If not, there's no session to validate — skip the network call entirely.
 */
function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.includes("auth-token") && c.value.length > 0
  );
}

/**
 * Clear all Supabase auth cookies from a response to prevent stale
 * refresh tokens from being sent on subsequent requests.
 */
function clearSupabaseAuthCookies(request: NextRequest, res: NextResponse): void {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")) {
      res.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
    }
  }
}

export async function updateSession(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isApiAdminRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // Skip middleware for public routes
  if (!isAdminRoute && !isApiAdminRoute) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Admin routes: construct request headers containing "x-is-admin" = "true"
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-is-admin", "true");

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ✅ FAST PATH: If there are no Supabase auth cookies at all, the user has no
  // session. Skip creating a Supabase client and the expensive getUser() network
  // call entirely. This prevents the "refresh_token_not_found" error from ever
  // being triggered, since there's nothing to refresh.
  if (!hasSupabaseAuthCookies(request)) {
    if (isLoginPage) {
      return response; // Let the login page render
    }
    if (isApiAdminRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Auth cookies exist — create client and validate the session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Validate the session via getUser() (makes a network call to Supabase Auth)
  let user = null;
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      if (authError.status === 400 || authError.message?.includes("refresh_token")) {
        // Session expired or refresh token revoked — clear stale cookies
        clearSupabaseAuthCookies(request, response);
      } else {
        console.warn("Auth check failed in middleware:", {
          status: authError.status,
          message: authError.message,
          path: request.nextUrl.pathname,
        });
      }
    } else {
      user = authUser;
    }
  } catch (error: any) {
    // Handle Supabase AuthApiError (thrown before error is returned)
    clearSupabaseAuthCookies(request, response);
    if (!(error?.code === "refresh_token_not_found" || error?.__isAuthError)) {
      console.warn("Unexpected error in middleware auth check:", {
        code: error?.code,
        message: error?.message,
        path: request.nextUrl.pathname,
      });
    }
    // user remains null — will trigger redirect to login
  }

  if (user && !isLoginPage) {
    const lastActive = request.cookies.get("admin_last_active")?.value;
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    // If last_active is missing (browser restart) OR timeout exceeded (30 mins)
    if (!lastActive || (now - parseInt(lastActive, 10) > THIRTY_MINUTES)) {
      // Don't call signOut() — just clear the cookies directly to avoid
      // another network call that could itself trigger refresh_token_not_found
      response = NextResponse.redirect(new URL("/admin/login?expired=true", request.url));
      response.cookies.delete("admin_last_active");
      clearSupabaseAuthCookies(request, response);
      return response;
    }

    // Update last active timestamp (session cookie, no maxAge)
    response.cookies.set("admin_last_active", now.toString(), {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Protect admin routes: redirect to login if not authenticated
  if (!user && (isAdminRoute || isApiAdminRoute) && !isLoginPage) {
    // Clear any stale cookies before redirecting
    clearSupabaseAuthCookies(request, response);
    if (isApiAdminRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // If user is logged in and visits /admin/login, redirect to dashboard
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

