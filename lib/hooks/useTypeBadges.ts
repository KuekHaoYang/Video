'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface TypeBadge {
  type: string;
  count: number;
}

/**
 * Custom hook to automatically collect and track type badges from video results
 * 
 * Features:
 * - Auto-collects unique type_name values
 * - Tracks count per type
 * - Updates dynamically as videos are added/removed
 * - Removes badges when count reaches 0
 * - Supports filtering by selected types
 */
export function useTypeBadges<T extends { type_name?: string }>(videos: T[]) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  // Collect and count type badges from videos
  const typeBadges = useMemo<TypeBadge[]>(() => {
    const typeMap = new Map<string, number>();
    
    videos.forEach(video => {
      if (video.type_name && video.type_name.trim()) {
        const type = video.type_name.trim();
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      }
    });

    // Convert to array and sort by count (descending)
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [videos]);

  // Filter videos by selected types
  const filteredVideos = useMemo(() => {
    if (selectedTypes.size === 0) {
      return videos;
    }
    
    return videos.filter(video => 
      video.type_name && selectedTypes.has(video.type_name.trim())
    );
  }, [videos, selectedTypes]);

  // Toggle type selection - useCallback to prevent re-creation
  const toggleType = useCallback((type: string) => {
    // Update selected types immediately (high priority)
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  // Auto-cleanup: remove selected types that no longer exist in badges
  useEffect(() => {
    const availableTypes = new Set(typeBadges.map(b => b.type));
    
    setSelectedTypes(prev => {
      const filtered = new Set(
        Array.from(prev).filter(type => availableTypes.has(type))
      );
      
      // Only update if changed
      if (filtered.size !== prev.size) {
        return filtered;
      }
      return prev;
    });
  }, [typeBadges]);

  return {
    typeBadges,
    selectedTypes,
    filteredVideos,
    toggleType,
  };
}
