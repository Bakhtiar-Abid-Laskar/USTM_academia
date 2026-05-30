import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isApiAdminRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // Skip middleware for public routes
  if (!isAdminRoute && !isApiAdminRoute) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

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
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // ✅ FIX: Gracefully handle auth errors (missing/expired refresh token)
  let user = null;
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      // Log auth errors but don't crash middleware
      // This can happen when refresh token doesn't exist
      if (authError.status === 400 || authError.message?.includes("refresh_token")) {
        // Expected behavior - session expired or invalid
        console.debug("Session invalid - user will be redirected to login:", {
          status: authError.status,
          code: authError.message,
          path: request.nextUrl.pathname,
        });
      } else {
        // Unexpected error
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
    // Handle Supabase AuthApiError and other exceptions
    if (error?.code === "refresh_token_not_found" || error?.__isAuthError) {
      console.debug("Session expired in middleware:", {
        code: error?.code,
        path: request.nextUrl.pathname,
      });
    } else {
      console.warn("Unexpected error in middleware auth check:", {
        code: error?.code,
        message: error?.message,
        path: request.nextUrl.pathname,
      });
    }
    // Continue with user = null, which will trigger re-authentication
  }

  if (user && !isLoginPage) {
    const lastActive = request.cookies.get("admin_last_active")?.value;
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    // If last_active is missing (browser restart) OR timeout exceeded (30 mins)
    if (!lastActive || (now - parseInt(lastActive, 10) > THIRTY_MINUTES)) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn("Failed to sign out during session timeout:", error);
      }
      response = NextResponse.redirect(new URL("/admin/login?expired=true", request.url));
      response.cookies.delete("admin_last_active");
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
