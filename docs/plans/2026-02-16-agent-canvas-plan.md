# Agent 画布实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**目标:** 在主界面右侧添加 Agent 配置管理画布，包含 Agent 卡片列表、配置编辑区、点击跳转终端会话功能

**架构:** 将 Agent 面板从底部移到右侧独立面板，采用左右分栏布局（卡片列表 | 配置编辑），支持展开/收起

**技术栈:** React + TypeScript + CSS Variables

---

## Task 1: 更新 Agent 类型定义

**Files:**
- Modify: `src/shared/types.ts:16-22`
- Modify: `src/main/store.ts` (添加 rules, systemPrompt 字段支持)
- Modify: `src/main/ipc.ts` (添加 Agent CRUD IPC)

**Step 1: 更新 Agent 接口**

```typescript
// src/shared/types.ts - 添加新字段
export interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'engineer' | 'reviewer';
  skills: string[];
  status: 'active' | 'idle' | 'thinking';
  rules?: string;        // 新增：规则文档
  systemPrompt?: string; // 新增：系统提示词
}
```

**Step 2: Commit**

```bash
git add src/shared/types.ts
git commit -m "feat: 扩展 Agent 类型添加 rules 和 systemPrompt 字段"
```

---

## Task 2: 创建 AgentCanvas 组件

**Files:**
- Create: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 创建基础组件结构**

```typescript
import React, { useState } from 'react';
import { Agent } from '@shared/types';

interface AgentCanvasProps {
  agents: Agent[];
  onStatusChange: (agentId: string, status: Agent['status']) => void;
  onSelectAgent: (agentId: string) => void;
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void;
}

const AgentCanvas: React.FC<AgentCanvasProps> = ({
  agents,
  onStatusChange,
  onSelectAgent,
  onUpdateAgent
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // ... 组件实现
};

export default AgentCanvas;
```

**Step 2: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 创建 AgentCanvas 基础组件"
```

---

## Task 3: 实现 Agent 卡片列表

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加 Agent 卡片渲染逻辑**

```typescript
const AgentCard: React.FC<{
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}> = ({ agent, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '12px',
      backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      borderRadius: '8px',
      border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
      cursor: 'pointer',
      marginBottom: '8px',
    }}
  >
    {/* 状态点 + 名称 + 状态标签 */}
    {/* 能力标签 */}
    {/* 操作按钮 */}
  </div>
);
```

**Step 2: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 实现 Agent 卡片列表渲染"
```

---

## Task 4: 实现配置编辑区

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加配置编辑区组件**

```typescript
const ConfigPanel: React.FC<{
  agent: Agent;
  onUpdate: (updates: Partial<Agent>) => void;
}> = ({ agent, onUpdate }) => (
  <div style={{ flex: 1, padding: '16px' }}>
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>规则文档</label>
      <textarea
        value={agent.rules || ''}
        onChange={(e) => onUpdate({ rules: e.target.value })}
        style={{ width: '100%', height: '120px', marginTop: '4px' }}
      />
    </div>
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>系统提示词</label>
      <textarea
        value={agent.systemPrompt || ''}
        onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
        style={{ width: '100%', height: '200px', marginTop: '4px' }}
      />
    </div>
  </div>
);
```

**Step 2: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 实现配置编辑区"
```

---

## Task 5: 实现面板展开/收起和 IPC

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`
- Modify: `src/main/ipc.ts` (添加 Agent 更新 IPC)
- Modify: `src/main/preload.ts`
- Modify: `src/renderer/electron.d.ts`

**Step 1: 添加展开/收起功能**

```typescript
// 面板头部
<div
  onClick={() => setIsExpanded(!isExpanded)}
  style={{
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}
>
  <span>Agent 画布</span>
  <span>{isExpanded ? '▶' : '◀'}</span>
</div>
```

**Step 2: 添加 IPC 暴露**

```typescript
// ipc.ts
ipcMain.handle('update-agent', (_event, agentId: string, updates: Partial<Agent>) => {
  // 实现更新逻辑
});

// preload.ts
updateAgent: (id: string, updates: Partial<Agent>) => ipcRenderer.invoke('update-agent', id, updates),
```

**Step 3: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx src/main/ipc.ts src/main/preload.ts src/renderer/electron.d.ts
git commit -m "feat: 添加面板展开收起和 IPC 通信"
```

---

## Task 6: 集成到 App 主界面

**Files:**
- Modify: `src/renderer/App.tsx`
- Modify: `src/renderer/stores/appStore.ts`

**Step 1: 在 App.tsx 中添加 AgentCanvas**

```typescript
import AgentCanvas from './components/AgentCanvas';

// 在主布局中添加
<div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
  <Sidebar ... />
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    <Terminal />
    <StatusBar ... />
  </div>
  <AgentCanvas
    agents={currentProject?.agents || []}
    onStatusChange={handleAgentStatusChange}
    onSelectAgent={handleSelectAgentSession}
    onUpdateAgent={handleUpdateAgent}
  />
</div>
```

**Step 2: 添加 onSelectAgent 处理函数**

```typescript
const handleSelectAgentSession = (agentId: string) => {
  // 找到对应的会话并切换
  const session = sessions.find(s => s.sessionId === agentId);
  if (session) {
    setActiveSessionId(agentId);
  }
};
```

**Step 3: Commit**

```bash
git add src/renderer/App.tsx src/renderer/stores/appStore.ts
git commit -m "feat: 集成 AgentCanvas 到主界面"
```

---

## Task 7: 构建和验证

**Step 1: 构建项目**

```bash
npm run build
```

**Step 2: 验证功能**

- [ ] Agent 画布面板显示在右侧
- [ ] Agent 卡片列表正确渲染
- [ ] 点击卡片显示配置编辑区
- [ ] 面板可以展开/收起
- [ ] 配置修改可以保存

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: 完成 Agent 画布功能"
```

---

## 执行方式

**Plan complete and saved to `docs/plans/2026-02-16-agent-canvas-plan.md`. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing_plans, batch execution with checkpoints

**Which approach?**
