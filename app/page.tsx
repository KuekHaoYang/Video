'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { SearchLoadingAnimation } from '@/components/SearchLoadingAnimation';
import Image from 'next/image';

// Cache interface
interface SearchCache {
  query: string;
  results: any[];
  availableSources: any[];
  timestamp: number;
}

const CACHE_KEY = 'kvideo_search_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [availableSources, setAvailableSources] = useState<any[]>([]);
  const [currentSource, setCurrentSource] = useState<string>('');
  const [checkedSources, setCheckedSources] = useState(0);
  const [searchStage, setSearchStage] = useState<'searching' | 'checking'>('searching');
  const [checkedVideos, setCheckedVideos] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedCache = useRef(false);

  // Load cached results on mount
  useEffect(() => {
    if (hasLoadedCache.current) return;
    hasLoadedCache.current = true;

    const urlQuery = searchParams.get('q');
    
    // Try to load from cache
    const cached = loadFromCache();
    
    if (urlQuery) {
      // URL has query parameter
      setQuery(urlQuery);
      
      if (cached && cached.query === urlQuery) {
        // Use cached results if they match the URL query
        console.log('📦 Loading cached results for:', urlQuery);
        setResults(cached.results);
        setAvailableSources(cached.availableSources);
        setHasSearched(true);
      } else {
        // Trigger automatic search for URL query (won't clear cache, will use existing if valid)
        console.log('🔍 Auto-searching for URL query:', urlQuery);
        setTimeout(() => performSearch(urlQuery, false), 100);
      }
    } else if (cached) {
      // No URL query but cache exists - restore last search
      console.log('📦 Restoring last search from cache:', cached.query);
      setQuery(cached.query);
      setResults(cached.results);
      setAvailableSources(cached.availableSources);
      setHasSearched(true);
      
      // Update URL to reflect cached search
      router.replace(`/?q=${encodeURIComponent(cached.query)}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Cache helper functions
  const saveToCache = (searchQuery: string, searchResults: any[], sources: any[]) => {
    const cache: SearchCache = {
      query: searchQuery,
      results: searchResults,
      availableSources: sources,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Saved search to cache:', searchQuery, searchResults.length, 'results');
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

  const performSearch = async (searchQuery: string, shouldClearCache: boolean = true) => {
    if (!searchQuery.trim() || loading) return;

    // Only clear cache if user manually clicked search button
    if (shouldClearCache) {
      const cached = loadFromCache();
      if (cached && cached.query === searchQuery) {
        console.log('🗑️ Clearing old cache for manual search');
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // Abort any previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this search
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setHasSearched(true);
    setResults([]);
    setAvailableSources([]);
    setCheckedSources(0);
    setSearchStage('searching');
    setCheckedVideos(0);
    setTotalVideos(0);
    
    // Update URL with query parameter
    router.replace(`/?q=${encodeURIComponent(searchQuery)}`, { scroll: false });
    
    try {
      // Get all enabled source IDs
      const sourceIds = ['dytt', 'ruyi', 'baofeng', 'tianya', 'feifan', 
                         'sanliuling', 'wolong', 'jisu', 'mozhua', 'modu',
                         'zuida', 'yinghua', 'baiduyun', 'wujin', 'wangwang', 'ikun'];
      
      // Use streaming API
      const response = await fetch('/api/search-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, sources: sourceIds }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      let buffer = '';
      const allVideos: any[] = [];
      const sourceVideoCounts = new Map<string, number>();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'progress':
                if (data.stage === 'searching') {
                  setSearchStage('searching');
                  setCheckedSources(data.checkedSources);
                } else if (data.stage === 'checking') {
                  setSearchStage('checking');
                  setCheckedVideos(data.checkedVideos);
                  setTotalVideos(data.totalVideos);
                }
                break;

              case 'videos':
                // Add new videos immediately - NO DELAY
                const newVideos = data.videos.map((video: any) => ({
                  ...video,
                  sourceName: getSourceName(video.source),
                  isNew: true,
                  addedAt: Date.now(), // Track when video was added
                }));

                console.log('📹 收到新视频:', newVideos.length, '个');

                // Add to allVideos array
                allVideos.push(...newVideos);
                
                console.log('🎬 当前总视频数:', allVideos.length);
                
                // Update state with all videos
                setResults([...allVideos]);

                // Update progress
                setCheckedVideos(data.checkedVideos);
                setTotalVideos(data.totalVideos);

                // Update source counts
                newVideos.forEach((video: any) => {
                  const count = sourceVideoCounts.get(video.source) || 0;
                  sourceVideoCounts.set(video.source, count + 1);
                });

                // Update available sources display
                const sourcesArray = Array.from(sourceVideoCounts.entries()).map(([sourceId, count]) => ({
                  id: sourceId,
                  name: getSourceName(sourceId),
                  count,
                }));
                setAvailableSources(sourcesArray);

                // Remove animation flag only for these new videos after delay
                setTimeout(() => {
                  setResults(prev => prev.map(v => {
                    // Only remove isNew flag from videos that were just added
                    const wasJustAdded = newVideos.some((nv: any) => 
                      nv.vod_id === v.vod_id && nv.source === v.source && nv.addedAt === v.addedAt
                    );
                    if (wasJustAdded) {
                      return { ...v, isNew: false };
                    }
                    return v;
                  }));
                }, 300);
                break;

              case 'complete':
                setCheckedVideos(data.totalVideos);
                setLoading(false);
                
                // Save final results to cache
                const finalSourcesArray = Array.from(sourceVideoCounts.entries()).map(([sourceId, count]) => ({
                  id: sourceId,
                  name: getSourceName(sourceId),
                  count,
                }));
                saveToCache(searchQuery, allVideos, finalSourcesArray);
                break;

              case 'error':
                throw new Error(data.error);
            }
          } catch (err) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error: any) {
      // Only show error if not aborted by user
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
      setLoading(false);
    } finally {
      setCurrentSource('');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pass true to clear cache when user manually clicks search
    await performSearch(query, true);
  };

  const getSourceName = (sourceId: string): string => {
    const sourceNames: Record<string, string> = {
      'dytt': '电影天堂',
      'ruyi': '如意',
      'baofeng': '暴风',
      'tianya': '天涯',
      'feifan': '非凡影视',
      'sanliuling': '360',
      'wolong': '卧龙',
      'jisu': '极速',
      'mozhua': '魔爪',
      'modu': '魔都',
      'zuida': '最大',
      'yinghua': '樱花',
      'baiduyun': '百度云',
      'wujin': '无尽',
      'wangwang': '旺旺',
      'ikun': 'iKun',
    };
    return sourceNames[sourceId] || sourceId;
  };

  return (
    <div className="min-h-screen">
      {/* Glass Navbar */}
      <nav className="sticky top-4 z-50 mx-4 mt-4 mb-8">
        <div className="max-w-7xl mx-auto bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] [-webkit-backdrop-filter:blur(25px)_saturate(180%)] border border-[var(--glass-border)] shadow-[var(--shadow-md)] px-6 py-4 transition-all duration-[var(--transition-fluid)]" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => {
                // Don't clear cache when clicking home - just reset the view
                setQuery('');
                setResults([]);
                setAvailableSources([]);
                setHasSearched(false);
              }}
            >
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image 
                  src="/icon.png" 
                  alt="KVideo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-color)]">
                  KVideo
                </h1>
                <p className="text-xs text-[var(--text-color-secondary)]">视频聚合平台</p>
              </div>
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section with Search */}
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-5xl md:text-6xl font-bold text-[var(--text-color)] mb-4">
            发现精彩视频
          </h2>
          <p className="text-xl text-[var(--text-color-secondary)] mb-8">
            多源聚合 · 智能搜索 · 极致体验
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative group">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索电影、电视剧、综艺..."
                className="text-lg pr-32"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                variant="primary"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-8"
              >
                <span className="flex items-center gap-2">
                  <Icons.Search size={20} />
                  搜索
                </span>
              </Button>
            </div>
            
            {/* Loading Animation - Replaces search bar content */}
            {loading && (
              <div className="mt-4">
                <SearchLoadingAnimation 
                  currentSource={currentSource}
                  checkedSources={checkedSources}
                  totalSources={16}
                  checkedVideos={checkedVideos}
                  totalVideos={totalVideos}
                  stage={searchStage}
                />
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        {(results.length >= 1 || (!loading && results.length > 0)) && (
          <div className="animate-fade-in">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-2xl font-bold text-[var(--text-color)] flex items-center gap-3">
                  <span>搜索结果</span>
                </h3>
                <div className="flex items-center gap-3">
                  {loading && (
                    <>
                      <Badge variant="secondary" className="text-sm">
                        <span className="flex items-center gap-2">
                          <Icons.Search size={14} />
                          已检测 {checkedVideos}/{totalVideos}
                        </span>
                      </Badge>
                      <Badge variant="primary" className="text-sm">
                        <span className="flex items-center gap-2">
                          <Icons.Check size={14} />
                          可用视频 {results.length}/{totalVideos}
                        </span>
                      </Badge>
                    </>
                  )}
                  {!loading && (
                    <Badge variant="primary">{results.length} 个视频</Badge>
                  )}
                </div>
              </div>
              
              {/* Available Sources */}
              {availableSources.length > 0 && (
                <Card hover={false} className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--text-color)] flex items-center gap-2">
                      <Icons.Check size={16} className="text-[var(--accent-color)]" />
                      可用源 ({availableSources.length}):
                    </span>
                    {availableSources.map((source) => (
                      <Badge 
                        key={source.id} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {source.name} ({source.count})
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {results.map((video, index) => {
                const videoUrl = `/player?${new URLSearchParams({
                  id: video.vod_id,
                  source: video.source,
                  title: video.vod_name,
                }).toString()}`;
                
                return (
                  <Link 
                    key={`${video.vod_id}-${index}`}
                    href={videoUrl}
                  >
                    <Card
                      className={`p-0 overflow-hidden group cursor-pointer flex flex-col h-full ${video.isNew ? 'animate-scale-in' : ''}`}
                    >
                      {/* Poster */}
                      <div className="relative aspect-[2/3] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] overflow-hidden" style={{ borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0' }}>
                        {video.vod_pic ? (
                          <img
                            src={video.vod_pic}
                            alt={video.vod_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icons.Film size={64} className="text-[var(--text-color-secondary)]" />
                          </div>
                        )}
                        
                        {/* Source Badge - Top Left */}
                        {video.sourceName && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="primary" className="text-xs backdrop-blur-md bg-[var(--accent-color)]/90">
                              {video.sourceName}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            {video.type_name && (
                              <Badge variant="secondary" className="text-xs mb-2">
                                {video.type_name}
                              </Badge>
                            )}
                            {video.vod_year && (
                              <div className="flex items-center gap-1 text-white/80 text-xs">
                                <Icons.Calendar size={12} />
                                <span>{video.vod_year}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info - Fixed height section */}
                      <div className="p-3 flex-1 flex flex-col">
                        <h4 className="font-semibold text-sm text-[var(--text-color)] line-clamp-2 min-h-[2.5rem] group-hover:text-[var(--accent-color)] transition-colors">
                          {video.vod_name}
                        </h4>
                        {video.vod_remarks && (
                          <p className="text-xs text-[var(--text-color-secondary)] mt-1 line-clamp-1">
                            {video.vod_remarks}
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State - Initial Homepage */}
        {!loading && !hasSearched && (
          <div className="text-center py-20 animate-fade-in">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] mb-6" style={{ borderRadius: 'var(--radius-full)' }}>
                <Icons.Film size={64} className="text-[var(--text-color-secondary)]" />
              </div>
              <h3 className="text-3xl font-bold text-[var(--text-color)] mb-4">
                开始探索精彩内容
              </h3>
              <p className="text-lg text-[var(--text-color-secondary)] max-w-2xl mx-auto mb-8">
                在上方搜索框输入关键词，从 16 个视频源聚合搜索海量影视资源
              </p>
              
              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <Card hover={false} className="text-center p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Icons.Zap size={48} className="text-[var(--accent-color)]" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-color)] mb-2">极速搜索</h4>
                  <p className="text-sm text-[var(--text-color-secondary)]">多源并行，秒级响应</p>
                </Card>
                <Card hover={false} className="text-center p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Icons.Target size={48} className="text-[var(--accent-color)]" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-color)] mb-2">精准匹配</h4>
                  <p className="text-sm text-[var(--text-color-secondary)]">智能算法，结果精准</p>
                </Card>
                <Card hover={false} className="text-center p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Icons.Sparkles size={48} className="text-[var(--accent-color)]" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-color)] mb-2">极致体验</h4>
                  <p className="text-sm text-[var(--text-color-secondary)]">流畅播放，完美适配</p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* No Results - After Search */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] mb-6" style={{ borderRadius: 'var(--radius-full)' }}>
              <Icons.Search size={64} className="text-[var(--text-color-secondary)]" />
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-color)] mb-4">
              未找到相关内容
            </h3>
            <p className="text-lg text-[var(--text-color-secondary)] mb-6">
              试试其他关键词或检查拼写
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setHasSearched(false);
                setQuery('');
                router.replace('/', { scroll: false });
              }}
            >
              返回首页
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent"></div>
    </div>}>
      <HomePage />
    </Suspense>
  );
}
