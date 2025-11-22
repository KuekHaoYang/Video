# 贡献指南 (Contributing Guide)

感谢你对 **KVideo** 项目感兴趣！我们非常欢迎并感谢社区的任何贡献，无论是修复 Bug、改进文档，还是提出新功能建议。

为了确保协作顺畅，请在提交贡献前花几分钟阅读以下指南。

## 🤝 行为准则

我们致力于构建一个开放、友好、包容的社区。请在参与项目时保持尊重和礼貌。

## 🛠 开发流程

### 1. Fork 项目

首先，将本仓库 Fork 到你自己的 GitHub 账号下。

### 2. 克隆到本地

```bash
git clone https://github.com/KuekHaoYang/KVideo.git
cd KVideo
```

### 3. 创建分支

请基于 `main` 分支创建新的功能分支。分支命名建议遵循以下规范：

*   `feat/功能名称`: 新功能 (例如: `feat/add-subtitle-support`)
*   `fix/问题描述`: 修复 Bug (例如: `fix/search-bar-layout`)
*   `docs/文档修改`: 文档更新 (例如: `docs/update-readme`)
*   `refactor/重构`: 代码重构 (例如: `refactor/api-client`)

```bash
git checkout -b feat/your-feature-name
```

### 4. 开发与调试

请确保你的代码符合项目的技术栈和风格：

*   **TypeScript**: 请尽量使用强类型，避免使用 `any`。
*   **Tailwind CSS**: 使用 Tailwind 类名进行样式开发，保持 "Liquid Glass" 的设计风格。
*   **组件化**: 保持组件的单一职责，复用 `components/ui` 下的基础组件。

启动本地开发服务器：

```bash
npm run dev
```

### 5. 提交代码 (Commit)

我们推荐使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来编写提交信息：

*   `feat`: 新功能
*   `fix`: 修复 Bug
*   `docs`: 文档变更
*   `style`: 代码格式 (不影响代码运行的变动)
*   `refactor`: 重构 (既不是新增功能，也不是修改 bug 的代码变动)
*   `perf`: 性能优化
*   `test`: 增加测试
*   `chore`: 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: 增加视频倍速播放功能"
```

### 6. 提交 Pull Request (PR)

1.  将代码推送到你的远程仓库：`git push origin feat/your-feature-name`
2.  在 GitHub 上发起 Pull Request 到 `KVideo:main` 分支。
3.  请在 PR 描述中详细说明你的修改内容、解决的问题以及测试截图（如果是 UI 变更）。

## 📐 代码风格

本项目使用 ESLint 和 Prettier 进行代码检查和格式化。在提交代码前，请确保通过了代码检查：

```bash
npm run lint
```

## 🐛 发现 Bug？

如果你发现了 Bug，请在 GitHub Issues 中提交报告。提交时请包含以下信息：

*   Bug 的详细描述
*   复现步骤
*   预期的行为
*   截图或报错日志 (如果有)
*   你的运行环境 (浏览器版本, OS 等)

## 💡 提出新功能？

如果你有新的想法，欢迎在 Issues 中提出 Feature Request。请详细描述该功能的用途和你的实现思路。

再次感谢你的贡献！让我们一起把 KVideo 变得更好！
