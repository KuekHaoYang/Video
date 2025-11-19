/**
 * SourceBadgeList - Badge list container with responsive layout
 * Desktop: Expandable grid with show more/less
 * Mobile: Horizontal scroll with snap
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Icons } from '@/components/ui/Icon';
import { SourceBadgeItem } from './SourceBadgeItem';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';

interface Source {
  id: string;
  name: string;
  count: number;
}

interface SourceBadgeListProps {
  sources: Source[];
  selectedSources: Set<string>;
  onToggleSource: (sourceId: string) => void;
}

export function SourceBadgeList({ sources, selectedSources, onToggleSource }: SourceBadgeListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation
  useKeyboardNavigation({
    enabled: true,
    containerRef: containerRef,
    currentIndex: focusedIndex,
    itemCount: sources.length,
    orientation: 'horizontal',
    onNavigate: useCallback((index: number) => {
      setFocusedIndex(index);
      badgeRefs.current[index]?.focus();
      // Scroll into view for mobile
      badgeRefs.current[index]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center',
      });
    }, []),
    onSelect: useCallback((index: number) => {
      onToggleSource(sources[index].id);
    }, [sources, onToggleSource]),
  });

  return (
    <>
      {/* Desktop: Expandable Grid */}
      <div 
        ref={containerRef}
        className="hidden md:flex md:flex-col md:flex-1 -mx-1 px-1"
        role="group"
        aria-label="视频源筛选"
      >
        <div className={`flex items-center gap-2 flex-wrap transition-all duration-300 ${
          !isExpanded ? 'max-h-[3rem] overflow-hidden' : ''
        }`}>
          {sources.map((source, index) => (
            <SourceBadgeItem
              key={source.id}
              id={source.id}
              name={source.name}
              count={source.count}
              isSelected={selectedSources.has(source.id)}
              onToggle={() => onToggleSource(source.id)}
              isFocused={focusedIndex === index}
              onFocus={() => setFocusedIndex(index)}
              innerRef={(el: HTMLButtonElement | null) => { badgeRefs.current[index] = el; }}
            />
          ))}
        </div>
        
        {sources.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] 
                     flex items-center gap-1 transition-colors self-start"
          >
            <span>{isExpanded ? '收起' : '展开更多'}</span>
            <Icons.ChevronDown 
              size={14} 
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Mobile & Tablet: Horizontal Scroll */}
      <div 
        className="flex md:hidden flex-1 -mx-1 px-1 overflow-hidden"
        role="group"
        aria-label="视频源筛选"
      >
        <div 
          ref={containerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        >
          {sources.map((source, index) => (
            <SourceBadgeItem
              key={source.id}
              id={source.id}
              name={source.name}
              count={source.count}
              isSelected={selectedSources.has(source.id)}
              onToggle={() => onToggleSource(source.id)}
              isFocused={focusedIndex === index}
              onFocus={() => setFocusedIndex(index)}
              innerRef={(el: HTMLButtonElement | null) => { badgeRefs.current[index] = el; }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
