/**
 * Core type definitions for KVideo platform
 */

// API Source Configuration
export interface VideoSource {
  id: string;
  name: string;
  baseUrl: string;
  searchPath: string;
  detailPath: string;
  headers?: Record<string, string>;
  enabled?: boolean;
  priority?: number;
}

// Video Search Result
export interface VideoItem {
  vod_id: number | string;
  vod_name: string;
  vod_pic: string;
  type_name?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_area?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  source: string;
}

// Episode Information
export interface Episode {
  name: string;
  url: string;
  index: number;
}

// Full Video Detail
export interface VideoDetail {
  vod_id: number | string;
  vod_name: string;
  vod_pic: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_area?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  type_name?: string;
  episodes: Episode[];
  source: string;
  source_code: string;
}

// History Entry
export interface VideoHistoryItem {
  videoId: string | number;
  title: string;
  url: string;
  episodeIndex: number;
  source: string;
  timestamp: number;
  playbackPosition: number;
  duration: number;
  poster?: string;
  episodes: Episode[];
  showIdentifier: string; // Unique identifier for deduplication
}

// API Response Structures
export interface ApiSearchResponse {
  code: number;
  msg?: string;
  page?: number;
  pagecount?: number;
  limit?: number;
  total?: number;
  list: VideoItem[];
}

export interface ApiDetailResponse {
  code: number;
  msg?: string;
  list: Array<{
    vod_id: number | string;
    vod_name: string;
    vod_pic: string;
    vod_remarks?: string;
    vod_year?: string;
    vod_area?: string;
    vod_actor?: string;
    vod_director?: string;
    vod_content?: string;
    type_name?: string;
    vod_play_from?: string;
    vod_play_url?: string;
  }>;
}

// Detail Request Types
export interface DetailRequest {
  id: string | number;
  source: string;
  customApi?: string;
}

