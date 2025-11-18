/**
 * Video Source Configuration and Management
 * Handles third-party video API sources with validation and health checks
 */

import type { VideoSource } from '@/lib/types';

// Default predefined video sources - Real Chinese video APIs
const DEFAULT_SOURCES: VideoSource[] = [
  {
    id: 'dytt',
    name: '电影天堂',
    baseUrl: 'http://caiji.dyttzyapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 1,
  },
  {
    id: 'ruyi',
    name: '如意',
    baseUrl: 'https://cj.rycjapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 2,
  },
  {
    id: 'baofeng',
    name: '暴风',
    baseUrl: 'https://bfzyapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 3,
  },
  {
    id: 'tianya',
    name: '天涯',
    baseUrl: 'https://tyyszy.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 4,
  },
  {
    id: 'feifan',
    name: '非凡影视',
    baseUrl: 'http://ffzy5.tv/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 5,
  },
  {
    id: 'sanliuling',
    name: '360',
    baseUrl: 'https://360zy.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 6,
  },
  {
    id: 'wolong',
    name: '卧龙',
    baseUrl: 'https://wolongzyw.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 7,
  },
  {
    id: 'jisu',
    name: '极速',
    baseUrl: 'https://jszyapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 8,
  },
  {
    id: 'mozhua',
    name: '魔爪',
    baseUrl: 'https://mozhuazy.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 9,
  },
  {
    id: 'modu',
    name: '魔都',
    baseUrl: 'https://www.mdzyapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 10,
  },
  {
    id: 'zuida',
    name: '最大',
    baseUrl: 'https://api.zuidapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 11,
  },
  {
    id: 'yinghua',
    name: '樱花',
    baseUrl: 'https://m3u8.apiyhzy.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 12,
  },
  {
    id: 'baiduyun',
    name: '百度云',
    baseUrl: 'https://api.apibdzy.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 13,
  },
  {
    id: 'wujin',
    name: '无尽',
    baseUrl: 'https://api.wujinapi.me/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 14,
  },
  {
    id: 'wangwang',
    name: '旺旺',
    baseUrl: 'https://wwzy.tv/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 15,
  },
  {
    id: 'ikun',
    name: 'iKun',
    baseUrl: 'https://ikunzyapi.com/api.php/provide/vod',
    searchPath: '',
    detailPath: '',
    enabled: true,
    priority: 16,
  },
];

/**
 * Get source by ID
 */
export function getSourceById(id: string): VideoSource | undefined {
  return DEFAULT_SOURCES.find(source => source.id === id);
}

