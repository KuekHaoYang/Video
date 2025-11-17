'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Icons } from '@/components/ui/Icon';
import Image from 'next/image';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [playUrl, setPlayUrl] = useState('');
  const [videoError, setVideoError] = useState<string>('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');

  const getSourceName = (sourceId: string | null): string => {
    if (!sourceId) return '';
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

  useEffect(() => {
    if (!videoId || !source) {
      router.push('/');
      return;
    }

    setLoading(true);
    fetchVideoDetails();
  }, [videoId, source]);

  const fetchVideoDetails = async () => {
    try {
      setVideoError(''); // Clear previous errors
      const response = await fetch(`/api/detail?id=${videoId}&source=${source}`);
      const data = await response.json();

      console.log('Video detail API response:', data);

      if (!response.ok) {
        // Handle specific error case when source is not available
        if (response.status === 404) {
          setVideoError(data.error || 'This video source is not available. Please go back and try another source.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success && data.data) {
        console.log('Video data received:', {
          id: data.data.vod_id,
          name: data.data.vod_name,
          episodeCount: data.data.episodes?.length || 0,
          firstEpisodeUrl: data.data.episodes?.[0]?.url
        });

        setVideoData(data.data);
        setLoading(false);
        if (data.data.episodes && data.data.episodes.length > 0) {
          const firstUrl = data.data.episodes[0].url;
          console.log('Setting initial play URL:', firstUrl);
          setPlayUrl(firstUrl);
          setIsVideoLoading(true);
        } else {
          console.warn('No episodes found in video data');
          setVideoError('No playable episodes available for this video from this source');
        }
      } else {
        throw new Error(data.error || 'Invalid response from API');
      }
    } catch (error) {
      console.error('Failed to fetch video details:', error);
      setVideoError(error instanceof Error ? error.message : 'Failed to load video details. Please try another source.');
      setLoading(false);
    }
  };

  const handleEpisodeClick = (episode: any, index: number) => {
    setCurrentEpisode(index);
    setPlayUrl(episode.url);
    setVideoError(''); // Clear any previous errors
    setIsVideoLoading(true);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    let errorMessage = 'Video playback failed';
    
    if (video.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video format is not supported or corrupted';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video source not supported or unavailable';
          break;
        default:
          errorMessage = `Video error: ${video.error.message || 'Unknown error'}`;
      }
    }
    
    console.error('Video playback error:', errorMessage, video.error);
    setVideoError(errorMessage);
    setIsVideoLoading(false);
  };

  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
    setVideoError('');
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      {/* Glass Navbar */}
      <nav className="sticky top-4 z-50 mx-4 mt-4 mb-8">
        <div className="max-w-7xl mx-auto bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[0_4px_12px_color-mix(in_srgb,var(--shadow-color)_40%,transparent)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center justify-center hover:opacity-80 transition-opacity"
                title="返回首页"
              >
                <Image 
                  src="/icon.png" 
                  alt="KVideo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </button>
              <Button 
                variant="secondary" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <Icons.ChevronLeft size={20} />
                <span>返回</span>
              </Button>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent mb-4"></div>
            <p className="text-[var(--text-color-secondary)]">正在加载视频详情...</p>
          </div>
        ) : videoError && !videoData ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Card className="max-w-2xl">
              <Icons.AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">视频源不可用</h2>
              <p className="text-[var(--text-color-secondary)] mb-6">{videoError}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="primary"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <Icons.ChevronLeft size={20} />
                  <span>返回</span>
                </Button>
                <Button 
                  variant="secondary"
                  onClick={fetchVideoDetails}
                  className="flex items-center gap-2"
                >
                  <Icons.RefreshCw size={20} />
                  <span>重新检测</span>
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player */}
              <Card hover={false} className="p-0 overflow-hidden">
                {playUrl ? (
                    <div className="relative aspect-video bg-black rounded-[var(--radius-2xl)] overflow-hidden">
                      {videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10 p-4">
                          <div className="text-center text-white max-w-md">
                            <Icons.AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
                            <p className="text-lg font-semibold mb-2">播放失败</p>
                            <p className="text-sm text-gray-300 mb-4">{videoError}</p>
                            <div className="flex gap-2 justify-center flex-wrap">
                              <Button 
                                variant="primary"
                                onClick={() => {
                                  setVideoError('');
                                  if (videoRef.current) {
                                    videoRef.current.load();
                                  }
                                }}
                                className="flex items-center gap-2"
                              >
                                <Icons.RefreshCw size={16} />
                                <span>重试</span>
                              </Button>
                              <Button 
                                variant="secondary"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                              >
                                <Icons.ChevronLeft size={16} />
                                <span>返回</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isVideoLoading && !videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                          <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                            <p className="text-sm">加载中...</p>
                          </div>
                        </div>
                      )}
                      
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        autoPlay
                        src={playUrl}
                        onError={handleVideoError}
                        onLoadStart={handleVideoLoadStart}
                        onCanPlay={handleVideoCanPlay}
                        onLoadedMetadata={() => {
                          if (videoRef.current && videoData) {
                            const savedTime = localStorage.getItem(`video_progress_${videoData.vod_id}_${currentEpisode}`);
                            if (savedTime) {
                              videoRef.current.currentTime = parseFloat(savedTime);
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] rounded-[var(--radius-2xl)] flex items-center justify-center border border-[var(--glass-border)]">
                      <div className="text-center text-[var(--text-secondary)]">
                        <Icons.TV size={64} className="text-[var(--text-color-secondary)] mx-auto mb-4" />
                        <p>暂无播放源</p>
                      </div>
                    </div>
                  )}
              </Card>

              {/* Video Info */}
              <Card hover={false}>
                <div className="flex items-start gap-4">
                  {videoData?.vod_pic && (
                    <img
                      src={videoData.vod_pic}
                      alt={videoData.vod_name}
                      className="w-32 h-48 object-cover rounded-[var(--radius-2xl)] border border-[var(--glass-border)]"
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-[var(--text-color)] mb-3">
                      {videoData?.vod_name || title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {source && (
                        <Badge variant="primary" className="backdrop-blur-md">
                          <Icons.Check size={14} className="mr-1" />
                          {getSourceName(source)}
                        </Badge>
                      )}
                      {videoData?.type_name && (
                        <Badge variant="secondary">{videoData.type_name}</Badge>
                      )}
                      {videoData?.vod_year && (
                        <Badge variant="secondary">
                          <Icons.Calendar size={14} className="mr-1" />
                          {videoData.vod_year}
                        </Badge>
                      )}
                      {videoData?.vod_area && (
                        <Badge variant="secondary">
                          <Icons.Globe size={14} className="mr-1" />
                          {videoData.vod_area}
                        </Badge>
                      )}
                    </div>
                    {videoData?.vod_content && (
                      <p className="text-[var(--text-secondary)] line-clamp-3">
                        {videoData.vod_content.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                    {videoData?.vod_actor && (
                      <p className="text-sm text-[var(--text-tertiary)] mt-2">
                        <span className="font-semibold">主演：</span>
                        {videoData.vod_actor}
                      </p>
                    )}
                    {videoData?.vod_director && (
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        <span className="font-semibold">导演：</span>
                        {videoData.vod_director}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Episodes Sidebar */}
            <div className="lg:col-span-1">
              <Card hover={false} className="sticky top-32">
                <h3 className="text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                  <Icons.List size={24} />
                  <span>选集</span>
                  {videoData?.episodes && (
                    <Badge variant="primary">{videoData.episodes.length}</Badge>
                  )}
                </h3>

                <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                  {videoData?.episodes && videoData.episodes.length > 0 ? (
                    videoData.episodes.map((episode: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleEpisodeClick(episode, index)}
                        className={`
                          w-full px-4 py-3 rounded-[var(--radius-2xl)] text-left transition-[var(--transition-fluid)]
                          ${currentEpisode === index
                            ? 'bg-[var(--accent-color)] text-white shadow-[0_4px_12px_color-mix(in_srgb,var(--accent-color)_50%,transparent)] brightness-110'
                            : 'bg-[var(--glass-bg)] hover:bg-[var(--glass-hover)] text-[var(--text-color)] border border-[var(--glass-border)]'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {episode.name || `第 ${index + 1} 集`}
                          </span>
                          {currentEpisode === index && (
                            <Icons.Play size={16} />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[var(--text-secondary)]">
                      <Icons.Inbox size={48} className="text-[var(--text-color-secondary)] mx-auto mb-2" />
                      <p>暂无剧集信息</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent"></div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
