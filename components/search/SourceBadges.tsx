/**
 * SourceBadges - Clickable video source badges with filtering
 * Shows available video sources with counts
 * Click to filter videos by source
 * Responsive: Desktop shows expand/collapse, Mobile shows horizontal scroll
 */

'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';
import { SourceBadgeList } from './SourceBadgeList';

interface Source {
  id: string;
  name: string;
  count: number;
}

interface SourceBadgesProps {
  sources: Source[];
  selectedSources: Set<string>;
  onToggleSource: (sourceId: string) => void;
  className?: string;
}

export const SourceBadges = memo(function SourceBadges({ 
  sources, 
  selectedSources,
  onToggleSource,
  className = '' 
}: SourceBadgesProps) {
  if (sources.length === 0) {
    return null;
  }

  const handleClearAll = () => {
    selectedSources.forEach(sourceId => onToggleSource(sourceId));
  };

  return (
    <Card 
      hover={false} 
      className={`p-4 animate-fade-in bg-[var(--bg-color)]/50 backdrop-blur-none saturate-100 shadow-sm border-[var(--glass-border)] ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Icons.Globe size={16} className="text-[var(--accent-color)]" />
          <span className="text-sm font-semibold text-[var(--text-color)]">
            视频源 ({sources.length}):
          </span>
        </div>
        
        <SourceBadgeList
          sources={sources}
          selectedSources={selectedSources}
          onToggleSource={onToggleSource}
        />
      </div>
      
      {selectedSources.size > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
          <button
            onClick={handleClearAll}
            className="text-xs text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] 
                     flex items-center gap-1 transition-colors"
          >
            <Icons.X size={12} />
            清除筛选 ({selectedSources.size})
          </button>
        </div>
      )}
    </Card>
  );
});
