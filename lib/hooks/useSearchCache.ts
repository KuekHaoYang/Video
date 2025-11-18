import { useRef } from 'react';

interface SearchCache {
  query: string;
  results: any[];
  availableSources: any[];
  timestamp: number;
}

const CACHE_KEY = 'kvideo_search_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useSearchCache() {
  const saveToCache = (
    query: string,
    results: any[],
    sources: any[]
  ) => {
    const cache: SearchCache = {
      query,
      results,
      availableSources: sources,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Saved search to cache:', query, results.length, 'results');
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  };

  const loadFromCache = (): SearchCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cache: SearchCache = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - cache.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return cache;
    } catch (error) {
      console.error('Failed to load cache:', error);
      return null;
    }
  };

  return {
    saveToCache,
    loadFromCache,
  };
}
