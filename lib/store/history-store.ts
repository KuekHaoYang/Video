/**
 * History State Store using Zustand
 * Manages viewing history with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VideoHistoryItem, Episode } from '@/lib/types';

const MAX_HISTORY_ITEMS = 50;

interface HistoryStore {
  viewingHistory: VideoHistoryItem[];
  
  // Actions
  addToHistory: (
    videoId: string | number,
    title: string,
    url: string,
    episodeIndex: number,
    source: string,
    playbackPosition: number,
    duration: number,
    poster?: string,
    episodes?: Episode[]
  ) => void;
  
  updateProgress: (
    videoId: string | number,
    source: string,
    episodeIndex: number,
    position: number,
    duration: number
  ) => void;
  
  getHistory: () => VideoHistoryItem[];
  getHistoryItem: (videoId: string | number, source: string) => VideoHistoryItem | undefined;
  removeFromHistory: (videoId: string | number, source: string) => void;
  clearHistory: () => void;
}

/**
 * Generate unique identifier for deduplication
 */
function generateShowIdentifier(
  title: string,
  source: string,
  videoId: string | number
): string {
  return `${source}:${videoId}:${title.toLowerCase().trim()}`;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      viewingHistory: [],

      addToHistory: (
        videoId,
        title,
        url,
        episodeIndex,
        source,
        playbackPosition,
        duration,
        poster,
        episodes = []
      ) => {
        const showIdentifier = generateShowIdentifier(title, source, videoId);
        const timestamp = Date.now();

        set((state) => {
          // Check if item already exists
          const existingIndex = state.viewingHistory.findIndex(
            (item) => item.showIdentifier === showIdentifier
          );

          let newHistory: VideoHistoryItem[];

          if (existingIndex !== -1) {
            // Update existing item and move to top
            const updatedItem: VideoHistoryItem = {
              ...state.viewingHistory[existingIndex],
              url,
              episodeIndex,
              playbackPosition,
              duration,
              timestamp,
              episodes: episodes.length > 0 ? episodes : state.viewingHistory[existingIndex].episodes,
            };

            newHistory = [
              updatedItem,
              ...state.viewingHistory.filter((_, index) => index !== existingIndex),
            ];
          } else {
            // Add new item at the top
            const newItem: VideoHistoryItem = {
              videoId,
              title,
              url,
              episodeIndex,
              source,
              timestamp,
              playbackPosition,
              duration,
              poster,
              episodes,
              showIdentifier,
            };

            newHistory = [newItem, ...state.viewingHistory];
          }

          // Limit history size
          if (newHistory.length > MAX_HISTORY_ITEMS) {
            newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
          }

          return { viewingHistory: newHistory };
        });
      },

      updateProgress: (videoId, source, episodeIndex, position, duration) => {
        set((state) => {
          const newHistory = state.viewingHistory.map((item) => {
            if (item.videoId === videoId && item.source === source) {
              return {
                ...item,
                episodeIndex,
                playbackPosition: position,
                duration,
                timestamp: Date.now(),
              };
            }
            return item;
          });

          return { viewingHistory: newHistory };
        });
      },

      getHistory: () => {
        return get().viewingHistory;
      },

      getHistoryItem: (videoId, source) => {
        return get().viewingHistory.find(
          (item) => item.videoId === videoId && item.source === source
        );
      },

      removeFromHistory: (videoId, source) => {
        set((state) => ({
          viewingHistory: state.viewingHistory.filter(
            (item) => !(item.videoId === videoId && item.source === source)
          ),
        }));
      },

      clearHistory: () => {
        set({ viewingHistory: [] });
      },
    }),
    {
      name: 'kvideo-history-store',
    }
  )
);
