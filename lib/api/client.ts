/**
 * API Client for fetching video data from multiple sources
 * Handles parallel requests, timeouts, retries, and data normalization
 */

import type {
  VideoSource,
  VideoItem,
  VideoDetail,
  Episode,
  ApiSearchResponse,
  ApiDetailResponse,
} from '@/lib/types';

const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Retry logic wrapper
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Search videos from a single source
 */
async function searchVideosBySource(
  query: string,
  source: VideoSource,
  page: number = 1
): Promise<{ results: VideoItem[]; source: string; responseTime: number }> {
  const startTime = Date.now();
  
  const url = new URL(`${source.baseUrl}${source.searchPath}`);
  url.searchParams.set('ac', 'detail');
  url.searchParams.set('wd', query);
  url.searchParams.set('pg', page.toString());

  try {
    const response = await withRetry(async () => {
      const res = await fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...source.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    });

    const data: ApiSearchResponse = await response.json();

    if (data.code !== 1 && data.code !== 0) {
      throw new Error(data.msg || 'Invalid API response');
    }

    const results: VideoItem[] = (data.list || []).map(item => ({
      ...item,
      source: source.id,
    }));

    return {
      results,
      source: source.id,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`Search failed for source ${source.name}:`, error);
    throw {
      code: 'SEARCH_FAILED',
      message: `Failed to search from ${source.name}`,
      source: source.id,
      retryable: true,
    };
  }
}

/**
 * Search videos from multiple sources in parallel
 */
export async function searchVideos(
  query: string,
  sources: VideoSource[],
  page: number = 1
): Promise<Array<{ results: VideoItem[]; source: string; responseTime?: number; error?: string }>> {
  const searchPromises = sources.map(async source => {
    try {
      return await searchVideosBySource(query, source, page);
    } catch (error) {
      return {
        results: [],
        source: source.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return Promise.all(searchPromises);
}

/**
 * Parse episode URL string into structured array
 */
function parseEpisodes(playUrl: string): Episode[] {
  if (!playUrl) return [];

  try {
    // Format: "Episode1$url1#Episode2$url2#..."
    const episodes = playUrl.split('#').filter(Boolean);
    
    return episodes.map((episode, index) => {
      const [name, url] = episode.split('$');
      return {
        name: name || `Episode ${index + 1}`,
        url: url || '',
        index,
      };
    });
  } catch (error) {
    console.error('Failed to parse episodes:', error);
    return [];
  }
}

/**
 * Get video detail from a single source
 */
export async function getVideoDetail(
  id: string | number,
  source: VideoSource
): Promise<VideoDetail> {
  const url = new URL(`${source.baseUrl}${source.detailPath}`);
  url.searchParams.set('ac', 'detail');
  url.searchParams.set('ids', id.toString());

  try {
    const response = await withRetry(async () => {
      const res = await fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...source.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    });

    const data: ApiDetailResponse = await response.json();

    console.log(`Video detail fetched from ${source.name}:`, {
      id,
      code: data.code,
      hasData: !!data.list && data.list.length > 0
    });

    if (data.code !== 1 && data.code !== 0) {
      throw new Error(data.msg || 'Invalid API response');
    }

    if (!data.list || data.list.length === 0) {
      throw new Error('Video not found');
    }

    const videoData = data.list[0];
    
    // Parse episodes from vod_play_url
    const episodes = parseEpisodes(videoData.vod_play_url || '');

    console.log(`Parsed ${episodes.length} episodes for video ${id}`);
    if (episodes.length > 0) {
      console.log('First episode URL:', episodes[0].url);
    }

    return {
      vod_id: videoData.vod_id,
      vod_name: videoData.vod_name,
      vod_pic: videoData.vod_pic,
      vod_remarks: videoData.vod_remarks,
      vod_year: videoData.vod_year,
      vod_area: videoData.vod_area,
      vod_actor: videoData.vod_actor,
      vod_director: videoData.vod_director,
      vod_content: videoData.vod_content,
      type_name: videoData.type_name,
      episodes,
      source: source.id,
      source_code: videoData.vod_play_from || '',
    };
  } catch (error) {
    console.error(`Detail fetch failed for source ${source.name}:`, error);
    throw {
      code: 'DETAIL_FAILED',
      message: `Failed to fetch video detail from ${source.name}`,
      source: source.id,
      retryable: false,
    };
  }
}

/**
 * Get video detail with custom API URL
 */
export async function getVideoDetailCustom(
  id: string | number,
  customApiUrl: string
): Promise<VideoDetail> {
  const customSource: VideoSource = {
    id: 'custom',
    name: 'Custom API',
    baseUrl: customApiUrl,
    searchPath: '',
    detailPath: '',
  };

  return getVideoDetail(id, customSource);
}
