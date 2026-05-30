import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function createClient() {
  const cookieStore = cookies();
  const headersList = headers();
  
  // Identify if we are in an admin context.
  // We check the custom header 'x-is-admin' which is set by the middleware.
  const isAdmin = headersList.get("x-is-admin") === "true";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // If this is a public page (not an admin route), do not expose
          // Supabase auth cookies. This prevents Supabase from trying to
          // parse or refresh a stale token on public pages, completely
          // eliminating "refresh_token_not_found" errors on public requests.
          if (!isAdmin && name.startsWith("sb-") && name.includes("auth-token")) {
            return undefined;
          }
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignored when called from Server Components (read-only)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    }
  );
}

/** Admin-only server client with service role key */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}
