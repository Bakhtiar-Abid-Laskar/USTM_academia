import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Safely get the authenticated user, handling refresh token errors gracefully.
 * Returns null if user is not authenticated or refresh fails.
 */
export async function safeGetUser(supabase: SupabaseClient) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Log auth errors but don't throw
      console.warn("Auth error (non-critical):", {
        code: error.status,
        message: error.message,
      });
      return null;
    }
    
    return user;
  } catch (error: any) {
    // Handle Supabase AuthApiError and other refresh token errors
    if (error?.code === "refresh_token_not_found" || error?.__isAuthError) {
      console.warn("Auth session invalid or expired:", {
        code: error?.code,
        message: error?.message,
      });
      return null;
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}
