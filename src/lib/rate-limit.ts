import { NextRequest } from "next/server";

/**
 * Simple in-memory rate limiter for development
 * For production, use Upstash Redis: https://upstash.com/docs/redis/features/ratelimiting
 * 
 * Usage:
 * const limiter = new SimpleRateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes
 * const { success, retryAfter } = await limiter.check("key");
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class SimpleRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async check(key: string): Promise<{ success: boolean; retryAfter?: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      // First request
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return { success: true };
    }

    if (now > entry.resetTime) {
      // Window expired, reset
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return { success: true };
    }

    if (entry.count < this.maxRequests) {
      // Within limit
      entry.count++;
      return { success: true };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { success: false, retryAfter };
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.store.delete(key));
  }
}

// ✅ Rate limiters for different endpoints
export const loginLimiter = new SimpleRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const uploadLimiter = new SimpleRateLimiter(10, 60 * 60 * 1000); // 10 uploads per hour
export const searchLimiter = new SimpleRateLimiter(60, 60 * 1000); // 60 searches per minute

/**
 * Helper to extract client IP from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0].trim() || real || "unknown";
}

/**
 * Helper to create rate limit key
 */
export function createRateLimitKey(identifier: string, category: string): string {
  return `${category}:${identifier}`;
}
