'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SearchForm } from '@/components/search/SearchForm';
import { VideoGrid } from '@/components/search/VideoGrid';
import { NoResults } from '@/components/search/NoResults';
import { ResultsHeader } from '@/components/search/ResultsHeader';
import { TypeBadges } from '@/components/search/TypeBadges';
import { PopularFeatures } from '@/components/home/PopularFeatures';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { useSearchCache } from '@/lib/hooks/useSearchCache';
import { useParallelSearch } from '@/lib/hooks/useParallelSearch';
import { useTypeBadges } from '@/lib/hooks/useTypeBadges';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadFromCache, saveToCache } = useSearchCache();
  const hasLoadedCache = useRef(false);
  
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Search stream hook
  const {
    loading,
    results,
    availableSources,
    completedSources,
    totalSources,
    totalVideosFound,
    performSearch,
    resetSearch,
    loadCachedResults,
  } = useParallelSearch(
    saveToCache,
    (q: string) => router.replace(`/?q=${encodeURIComponent(q)}`, { scroll: false })
  );

  // Type badges hook - auto-collects and filters by type_name
  const {
    typeBadges,
    selectedTypes,
    filteredVideos,
    toggleType,
  } = useTypeBadges(results);

  // Load cached results on mount
  useEffect(() => {
    if (hasLoadedCache.current) return;
    hasLoadedCache.current = true;

    const urlQuery = searchParams.get('q');
    const cached = loadFromCache();
    
    if (urlQuery) {
      setQuery(urlQuery);
      if (cached && cached.query === urlQuery && cached.results.length > 0) {
        console.log('📦 Loading cached results for:', urlQuery, cached.results.length, 'videos');
        setHasSearched(true);
        loadCachedResults(cached.results, cached.availableSources);
      } else {
        console.log('🔍 Auto-searching for URL query:', urlQuery);
        setTimeout(() => handleSearch(urlQuery), 100);
      }
    }
  }, [searchParams, loadFromCache, loadCachedResults]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
    performSearch(searchQuery);
  };

  const handleReset = () => {
    setHasSearched(false);
    setQuery('');
    resetSearch();
    router.replace('/', { scroll: false });
  };

  return (
    <div className="min-h-screen">
      {/* Glass Navbar */}
      <nav className="sticky top-0 z-50 pt-4 pb-2" style={{ transform: 'translateZ(0)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] [-webkit-backdrop-filter:blur(25px)_saturate(180%)] border border-[var(--glass-border)] shadow-[var(--shadow-md)] px-6 py-4 transition-all duration-[var(--transition-fluid)] rounded-[var(--radius-2xl)]">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={handleReset}
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
                  <h1 className="text-2xl font-bold text-[var(--text-color)]">KVideo</h1>
                  <p className="text-xs text-[var(--text-color-secondary)]">视频聚合平台</p>
                </div>
              </Link>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Search Form - Separate from navbar */}
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-8">
        <SearchForm
          onSearch={handleSearch}
          onClear={handleReset}
          isLoading={loading}
          initialQuery={query}
          currentSource=""
          checkedSources={completedSources}
          totalSources={totalSources}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Results Section */}
        {(results.length >= 1 || (!loading && results.length > 0)) && (
          <div className="animate-fade-in">
            <ResultsHeader
              loading={loading}
              resultsCount={results.length}
              availableSources={availableSources}
            />
            
            {/* Type Badges - Auto-collected from search results */}
            {typeBadges.length > 0 && (
              <TypeBadges
                badges={typeBadges}
                selectedTypes={selectedTypes}
                onToggleType={toggleType}
                className="mb-6"
              />
            )}
            
            {/* Display filtered or all videos */}
            <VideoGrid videos={filteredVideos} />
          </div>
        )}

        {/* Popular Features - Homepage */}
        {!loading && !hasSearched && <PopularFeatures onSearch={handleSearch} />}

        {/* No Results */}
        {!loading && hasSearched && results.length === 0 && (
          <NoResults onReset={handleReset} />
        )}
      </main>

      {/* Watch History Sidebar */}
      <WatchHistorySidebar />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
