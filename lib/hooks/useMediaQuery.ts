/**
 * useMediaQuery Hook
 * 媒体查询 Hook - 监听浏览器媒体查询状态变化
 * 
 * 遵循 Liquid Glass 设计系统原则：
 * - 响应式设计优先
 * - 性能优化（使用 matchMedia API）
 * - SSR 兼容
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * 使用媒体查询 Hook
 * @param query - CSS 媒体查询字符串（例如：'(min-width: 768px)'）
 * @returns boolean - 媒体查询是否匹配
 * 
 * @example
 * ```tsx
 * // 检测是否为移动设备
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * 
 * // 检测是否为暗色模式
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * 
 * // 检测是否为触摸设备
 * const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // 初始状态处理（SSR 兼容）
  const getMatches = (query: string): boolean => {
    // 防止 SSR 错误
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    // 防止 SSR 错误
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // 更新状态的处理函数
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 初始化时检查一次
    setMatches(mediaQuery.matches);

    // 添加监听器（现代浏览器使用 addEventListener）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器（已废弃的 API）
      // @ts-ignore
      mediaQuery.addListener(handleChange);
    }

    // 清理函数
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}
