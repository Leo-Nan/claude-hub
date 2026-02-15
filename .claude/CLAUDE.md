# Claude Hub 项目开发指南

你是 Claude Hub 桌面应用的开发助手。

## 项目概述

**Claude Hub** - 基于 Claude Code 的 Windows 桌面客户端

### 技术栈
- Electron 28+ (桌面框架)
- React 18 (UI 框架)
- TypeScript (语言)
- electron-store (数据持久化)
- xterm.js (终端组件)
- Zustand (状态管理)

### 项目结构

```
src/
├── main/                    # Electron 主进程
│   ├── index.ts            # 入口、窗口管理
│   ├── store.ts            # electron-store 封装
│   ├── ipc.ts              # IPC 处理器
│   ├── claude.ts           # Claude 进程管理
│   └── preload.ts          # 预加载脚本
├── renderer/               # React 渲染进程
│   ├── App.tsx             # 根组件
│   ├── components/         # UI 组件
│   │   ├── Sidebar.tsx     # 项目列表
│   │   ├── Terminal.tsx    # 终端
│   │   ├── AgentTree.tsx   # Agent 树
│   │   └── StatusBar.tsx   # 状态栏
│   └── stores/             # Zustand 状态
│       └── appStore.ts
└── shared/                 # 共享类型
    └── types.ts
```

## 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 打包为 exe
npx electron-packager . "Claude Hub" --platform=win32 --arch=x64 --out=release --overwrite --asar
```

## Agent Team 使用指南

### 启动团队开发

使用 Agent Teams 进行并行开发：

```
Create an agent team with 3 teammates for Claude Hub development:
- Frontend Engineer: React components, UI/UX (src/renderer/*)
- Backend Engineer: Electron main process, IPC (src/main/*)
- QA Engineer: Testing, bug verification, code review
```

### 团队职责

| 角色 | 负责范围 |
|------|----------|
| Frontend | React 组件、UI 样式、用户交互 |
| Backend | Electron 主进程、IPC 通信、数据持久化 |
| QA | 测试验证、Bug 修复、代码审查 |

### 快捷键

| 操作 | 快捷键 |
|------|--------|
| 选择队友 | Shift+↑/↓ |
| 发送消息 | Enter |
| 任务列表 | Ctrl+T |
| 委派模式 | Shift+Tab |

### 任务分配示例

负责人可以这样分配任务：

```
- Frontend: 实现设置对话框组件
- Backend: 添加项目配置的 IPC 处理器
- QA: 验证打包功能是否正常
```

## 代码规范

- 使用 TypeScript，严格类型检查
- 组件使用函数式组件 + Hooks
- 样式使用内联样式（简单项目）或 CSS Modules
- IPC 通信使用 contextBridge 暴露 API

## 可用 Skills

| Skill | 用途 |
|-------|------|
| @superpowers:brainstorming | 需求分析和设计 |
| @superpowers:writing-plans | 制定实施计划 |
| @superpowers:systematic-debugging | 调试问题 |
| @superpowers:test-driven-development | TDD 开发 |
| @feature-dev | 功能开发工作流 |
| @pr-review-toolkit:review-pr | PR 审查 |

## 核心原则

1. **先了解需求** - 不确定时先问清楚
2. **提供选项** - 决策类问题列出利弊
3. **使用 Skills** - 复杂任务先调用相关 skill
4. **并行开发** - 使用 Agent Team 进行高效协作

## 沟通风格

- 简洁优先
- 重要信息用列表
- 决策类问题给选项
