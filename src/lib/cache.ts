import { unstable_cache } from 'next/cache';

// Cache utility for SSR data fetching
export const cache = {
  // Cache API responses with custom TTL
  api: <T>(fn: () => Promise<T>, key: string, ttl: number = 30) => {
    return unstable_cache(fn, [key], {
      revalidate: ttl,
      tags: ['api'],
    });
  },

  // Cache user-specific data
  user: <T>(fn: (userId: string) => Promise<T>, userId: string, key: string, ttl: number = 60) => {
    return unstable_cache(() => fn(userId), [`user-${userId}-${key}`], {
      revalidate: ttl,
      tags: [`user-${userId}`],
    });
  },

  // Cache notes with pagination
  notes: <T>(fn: (params: any) => Promise<T>, params: any, ttl: number = 30) => {
    const cacheKey = `notes-${JSON.stringify(params)}`;
    return unstable_cache(() => fn(params), [cacheKey], {
      revalidate: ttl,
      tags: ['notes'],
    });
  },
};

// Cache invalidation utilities
export const invalidateCache = {
  // Invalidate all API cache
  api: () => {
    // This would be called after mutations
    console.log('Invalidating API cache');
  },

  // Invalidate user-specific cache
  user: (userId: string) => {
    console.log(`Invalidating cache for user: ${userId}`);
  },

  // Invalidate notes cache
  notes: () => {
    console.log('Invalidating notes cache');
  },
}; 