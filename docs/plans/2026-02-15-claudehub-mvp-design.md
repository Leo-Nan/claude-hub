# Claude Hub MVP 设计文档

**版本**: 1.0
**日期**: 2026-02-15
**状态**: 已批准

---

## 1. 项目概述

- **项目名称**: Claude Hub
- **类型**: Windows 桌面客户端
- **技术栈**: Electron + React 18 + TypeScript
- **目标**: 基于 Claude Code 的项目管理工具，提供项目列表、Agent 树状图、嵌入式终端功能

---

## 2. 技术架构

### 2.1 技术选型

| 技术 | 用途 | 备注 |
|------|------|------|
| Electron 28+ | 桌面框架 | 窗口管理、系统集成 |
| React 18 | UI 框架 | 组件化开发 |
| TypeScript | 语言 | 类型安全 |
| electron-store | 数据持久化 | 统一存储配置 |
| xterm.js | 终端组件 | 嵌入式 Claude 会话 |
| Zustand | 状态管理 | 轻量级状态管理 |

### 2.2 模块结构

```
src/
├── main/
│   ├── index.ts         # 入口 + 窗口管理
│   ├── store.ts         # electron-store 封装
│   ├── ipc.ts           # IPC 处理器
│   └── claude.ts        # Claude 进程管理
├── renderer/
│   ├── App.tsx          # 根组件
│   ├── index.tsx        # React 入口
│   ├── index.html       # HTML 模板
│   ├── components/
│   │   ├── Sidebar.tsx      # 项目列表侧边栏
│   │   ├── Terminal.tsx     # 嵌入式终端
│   │   ├── AgentTree.tsx    # Agent 树状图
│   │   └── StatusBar.tsx    # 状态栏
│   └── stores/
│       └── appStore.ts  # Zustand 状态
└── shared/
    └── types.ts         # 共享类型定义
```

### 2.3 数据流

```
用户操作 → React 组件 → Zustand Store → IPC 调用 → Main Process
                                                                    ↓
                                                              electron-store
                                                                    ↓
返回数据 ← 状态更新 ← IPC 响应 ← Store 读取 ←───────────────────────┘
```

---

## 3. 功能设计

### 3.1 项目管理

| 功能 | 描述 |
|------|------|
| 列表展示 | 左侧边栏显示所有已添加项目 |
| 添加项目 | 打开系统文件夹选择器，选择文件夹添加到列表 |
| 删除项目 | 右键菜单删除项目 |
| 切换项目 | 点击项目名切换当前项目 |

### 3.2 嵌入式终端

| 功能 | 描述 |
|------|------|
| 启动会话 | 在选中的项目目录下启动 `claude` 命令 |
| 输入输出 | 支持交互式输入和 Claude 输出显示 |
| 多会话 | 支持多个终端标签页 |

### 3.3 Agent 树状图

| 功能 | 描述 |
|------|------|
| 层级展示 | 显示 Agent 上下级关系（私人秘书 → 子 Agent） |
| 状态指示 | 活跃(绿)、空闲(灰)、思考中(黄) |
| 能力标签 | 显示每个 Agent 的技能列表 |
| 手动切换 | MVP 阶段支持手动切换状态 |

### 3.4 状态栏

| 指标 | 描述 |
|------|------|
| 活跃 Agent 数量 | 当前状态为 active 的 Agent 数量 |
| 会话时长 | 当前会话运行时间 |
| 当前项目 | 正在操作的项目名称 |

---

## 4. 数据模型

### 4.1 统一存储结构 (electron-store)

```typescript
interface AppConfig {
  theme: 'light';
  sidebarWidth: number;
  projects: Project[];
  currentProjectId: string | null;
}

interface Project {
  id: string;
  name: string;
  path: string;
  agents: Agent[];
  createdAt: string;
  lastOpened: string;
}

interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'engineer' | 'reviewer';
  skills: string[];
  status: 'active' | 'idle' | 'thinking';
}
```

### 4.2 默认 Agent 模板

```json
[
  {
    "id": "agent-1",
    "name": "调研员",
    "type": "researcher",
    "skills": ["搜索", "整理"],
    "status": "idle"
  },
  {
    "id": "agent-2",
    "name": "工程师",
    "type": "engineer",
    "skills": ["前端", "后端"],
    "status": "idle"
  },
  {
    "id": "agent-3",
    "name": "审查员",
    "type": "reviewer",
    "skills": ["代码审查"],
    "status": "idle"
  }
]
```

---

## 5. 错误处理

| 场景 | 处理方式 |
|------|----------|
| Claude CLI 未安装 | 弹窗提示，提供安装指引 |
| 项目路径不存在 | 标记为无效，显示警告图标 |
| 进程启动失败 | 终端显示错误信息，保持可用 |
| electron-store 失败 | 使用内存缓存，启动时警告 |

---

## 6. MVP 边界

### 已包含
- ✅ 项目列表 CRUD
- ✅ 项目切换
- ✅ 嵌入式终端（Claude 会话）
- ✅ Agent 树状图（静态 + 手动状态）
- ✅ 基础状态栏

### 暂不包含
- ❌ Token 用量统计
- ❌ Agent 实时状态同步
- ❌ 多会话管理
- ❌ 主题切换
- ❌ 托盘功能

---

## 7. 验收标准

1. 应用可正常启动，显示主界面
2. 可添加、删除、切换项目
3. 可启动 Claude 会话并交互
4. Agent 树状图正确渲染，状态可手动切换
5. 状态栏正确显示当前项目信息
6. 配置可持久化，重启后保留
