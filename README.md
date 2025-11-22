# KVideo

![KVideo Banner](public/icon.png)

> 一个基于 Next.js 16 构建的现代化视频聚合播放平台。采用独特的 "Liquid Glass" 设计语言，提供流畅的视觉体验和强大的视频搜索功能。

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## 📖 项目简介

**KVideo** 是一个高性能的视频聚合与播放应用。它利用 Next.js 16 的最新特性，结合 React 19 和 Tailwind CSS v4，打造了一个既美观又强大的视频浏览体验。

项目的核心设计理念是 **"Liquid Glass" (液态玻璃)** —— 一种强调透明感、模糊效果和流畅交互的视觉风格。

## ✨ 主要功能

*   **🎥 智能播放器**: 内置功能强大的视频播放器，支持多种流媒体格式，提供流畅的观看体验。
*   **🔍 聚合并行搜索**: 能够同时在多个视频源中进行并行搜索 (`lib/api/search-api.ts`)，快速定位目标内容。
*   **🎬 豆瓣深度集成**: 自动对接豆瓣 API (`app/api/douban`)，获取详尽的影视资料、评分和推荐。
*   **🎨 Liquid Glass UI**: 独特的玻璃拟态设计系统，配合精细的动画效果，带来沉浸式的视觉享受。
*   **💾 观看历史**: 本地化存储用户的观看进度和历史记录，随时继续观看。
*   **📱 全端响应式**: 精心设计的响应式布局，在桌面、平板和手机上都能完美运行。
*   **🌙 主题切换**: 内置深色模式与浅色模式，适应不同环境下的观看需求。

## 🛠 技术栈

本项目采用最前沿的前端技术栈构建：

*   **核心框架**: [Next.js 16](https://nextjs.org/) (App Router)
*   **UI 库**: [React 19](https://react.dev/)
*   **样式方案**: [Tailwind CSS v4](https://tailwindcss.com/) (配合 CSS Variables 实现动态主题)
*   **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
*   **编程语言**: [TypeScript](https://www.typescriptlang.org/)
*   **代码规范**: ESLint + Prettier

## 🚀 快速开始

按照以下步骤在本地启动项目：

### 1. 环境准备

确保你的开发环境满足以下要求：
*   **Node.js**: v20.0.0 或更高版本
*   **npm** 或 **yarn** / **pnpm**

### 2. 获取代码

```bash
git clone https://github.com/KuekHaoYang/KVideo.git
cd KVideo
```

### 3. 安装依赖

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可看到应用。

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 📂 项目结构

```
KVideo/
├── app/                 # Next.js App Router 路由与页面
│   ├── api/             # 后端 API 路由 (Douban, Search, etc.)
│   ├── player/          # 播放器页面
│   ├── settings/        # 设置页面
│   └── globals.css      # 全局样式 (包含 Liquid Glass 样式引入)
├── components/          # React UI 组件
│   ├── player/          # 播放器相关组件
│   ├── search/          # 搜索相关组件
│   ├── ui/              # 通用基础组件
│   └── ...
├── lib/                 # 工具函数与核心逻辑
│   ├── api/             # API 客户端与数据源定义
│   ├── store/           # Zustand 状态管理
│   └── utils/           # 通用工具函数
├── public/              # 静态资源
└── ...
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！详细的贡献规范请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 许可证

本项目基于 MIT 许可证开源。详情请参阅 [LICENSE](LICENSE) 文件。

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/KuekHaoYang">KuekHaoYang</a>
</div>
