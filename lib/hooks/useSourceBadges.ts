'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface SourceBadge {
  id: string;
  name: string;
  count: number;
}

/**
 * Custom hook to manage source badge filtering
 * 
 * Features:
 * - Tracks available video sources
 * - Supports filtering by selected sources
 * - Auto-cleanup when sources no longer exist
 */
export function useSourceBadges<T extends { source?: string; sourceName?: string }>(
  videos: T[],
  availableSources: SourceBadge[]
) {
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());

  // Filter videos by selected sources
  const filteredVideos = useMemo(() => {
    if (selectedSources.size === 0) {
      return videos;
    }
    
    return videos.filter(video => 
      video.source && selectedSources.has(video.source)
    );
  }, [videos, selectedSources]);

  // Toggle source selection
  const toggleSource = useCallback((sourceId: string) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  }, []);

  // Auto-cleanup: remove selected sources that no longer exist
  useEffect(() => {
    const availableSourceIds = new Set(availableSources.map(s => s.id));
    
    setSelectedSources(prev => {
      const filtered = new Set(
        Array.from(prev).filter(sourceId => availableSourceIds.has(sourceId))
      );
      
      // Only update if changed
      if (filtered.size !== prev.size) {
        return filtered;
      }
      return prev;
    });
  }, [availableSources]);

  return {
    selectedSources,
    filteredVideos,
    toggleSource,
  };
}
