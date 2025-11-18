/**
 * Search Utilities
 * Search relevance scoring and optimization
 */

import type { VideoItem } from '@/lib/types';

/**
 * Calculate search relevance score
 * Higher score = more relevant to the search query
 */
export function calculateRelevanceScore(item: VideoItem, query: string): number {
  let score = 0;
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTitle = item.vod_name.toLowerCase();

  // Split query into words for partial matching
  const queryWords = normalizedQuery.split(/\s+/);
  
  // 1. Exact title match (highest priority)
  if (normalizedTitle === normalizedQuery) {
    score += 1000;
    return score; // Early return for perfect match
  }

  // 2. Title starts with query (very high priority)
  if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 500;
  }

  // 3. Title contains full query as substring
  if (normalizedTitle.includes(normalizedQuery)) {
    score += 200;
    
    // Bonus for query appearing earlier in title
    const position = normalizedTitle.indexOf(normalizedQuery);
    score += Math.max(0, 50 - position * 2);
  }

  // 4. All query words present in title
  const allWordsPresent = queryWords.every(word => 
    normalizedTitle.includes(word)
  );
  if (allWordsPresent && queryWords.length > 1) {
    score += 100;
  }

  // 5. Individual word matches
  queryWords.forEach(word => {
    if (word.length < 2) return; // Skip very short words
    
    if (normalizedTitle.includes(word)) {
      score += 30;
      
      // Bonus if word is at the start
      if (normalizedTitle.startsWith(word)) {
        score += 20;
      }
    }
  });

  // 6. Actor match
  if (item.vod_actor) {
    const normalizedActor = item.vod_actor.toLowerCase();
    if (normalizedActor.includes(normalizedQuery)) {
      score += 80;
    }
    queryWords.forEach(word => {
      if (word.length >= 2 && normalizedActor.includes(word)) {
        score += 15;
      }
    });
  }

  // 7. Director match
  if (item.vod_director) {
    const normalizedDirector = item.vod_director.toLowerCase();
    if (normalizedDirector.includes(normalizedQuery)) {
      score += 60;
    }
    queryWords.forEach(word => {
      if (word.length >= 2 && normalizedDirector.includes(word)) {
        score += 10;
      }
    });
  }

  // 8. Content/description match (if available)
  if (item.vod_content) {
    const normalizedContent = item.vod_content.toLowerCase();
    if (normalizedContent.includes(normalizedQuery)) {
      score += 20;
    }
  }

  // 9. Recent year bonus (favor newer content)
  const currentYear = new Date().getFullYear();
  const itemYear = parseInt(item.vod_year || '0');
  if (itemYear > 0) {
    const yearDiff = currentYear - itemYear;
    if (yearDiff === 0) {
      score += 15; // Current year
    } else if (yearDiff === 1) {
      score += 10; // Last year
    } else if (yearDiff <= 3) {
      score += 5; // Within 3 years
    }
  }

  // 10. Penalty for very long titles (might be less relevant)
  if (item.vod_name.length > 50) {
    score -= 5;
  }

  // 11. Bonus for HD/quality indicators in remarks
  if (item.vod_remarks) {
    const remarks = item.vod_remarks.toLowerCase();
    if (remarks.includes('hd') || remarks.includes('1080') || remarks.includes('4k')) {
      score += 5;
    }
    if (remarks.includes('完结') || remarks.includes('全集')) {
      score += 3;
    }
  }

  return Math.max(0, score); // Ensure non-negative
}

