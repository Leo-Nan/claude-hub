# Agent 画布功能修复计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**目标:** 完善 Agent 画布设计稿中未完成的功能：面板宽度可调整、能力编辑、Agent CRUD、点击跳转

**架构:** 在现有 AgentCanvas 组件基础上添加新功能，扩展 IPC 支持 CRUD 操作

**技术栈:** React + TypeScript + IPC

---

## Task 1: 面板宽度可调整

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加宽度状态**

```typescript
const [panelWidth, setPanelWidth] = useState(360);
const [isDragging, setIsDragging] = useState(false);
```

**Step 2: 添加拖拽手柄**

```typescript
<div
  onMouseDown={() => setIsDragging(true)}
  onMouseUp={() => setIsDragging(false)}
  onMouseMove={(e) => {
    if (isDragging) {
      const newWidth = Math.max(280, Math.min(600, e.clientX));
      setPanelWidth(newWidth);
    }
  }}
  style={{ width: '4px', cursor: 'ew-resize', backgroundColor: 'var(--border-color)' }}
/>
```

**Step 3: 使用动态宽度**

```typescript
<div style={{ width: `${panelWidth}px`, ... }}>
```

**Step 4: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 添加面板宽度拖拽调整功能"
```

---

## Task 2: 能力列表编辑

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加 skills 编辑状态**

```typescript
const [editingSkills, setEditingSkills] = useState('');
```

**Step 2: 添加 skills 编辑输入框**

```typescript
<div>
  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>能力列表</label>
  <input
    value={editingSkills}
    onChange={(e) => setEditingSkills(e.target.value)}
    placeholder="skill1, skill2, skill3"
  />
  <button onClick={() => onUpdateAgent(selectedAgentId, { skills: editingSkills.split(',').map(s => s.trim()) })}>
    保存
  </button>
</div>
```

**Step 3: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 添加能力列表编辑功能"
```

---

## Task 3: Agent CRUD - 添加/删除

**Files:**
- Modify: `src/main/ipc.ts` (添加 create-agent, delete-agent)
- Modify: `src/main/preload.ts`
- Modify: `src/renderer/electron.d.ts`
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加 IPC 处理器**

```typescript
// ipc.ts
ipcMain.handle('create-agent', (_event, projectId: string, agent: Partial<Agent>) => {
  const project = store.getProjects().find(p => p.id === projectId);
  if (!project) return { error: '项目不存在' };
  const newAgent: Agent = {
    id: `agent_${Date.now()}`,
    name: agent.name || '新 Agent',
    type: agent.type || 'engineer',
    skills: agent.skills || [],
    status: 'idle',
    rules: agent.rules || '',
    systemPrompt: agent.systemPrompt || '',
  };
  project.agents.push(newAgent);
  store.updateProject(projectId, { agents: project.agents });
  return newAgent;
});

ipcMain.handle('delete-agent', (_event, projectId: string, agentId: string) => {
  const project = store.getProjects().find(p => p.id === projectId);
  if (!project) return { error: '项目不存在' };
  project.agents = project.agents.filter(a => a.id !== agentId);
  store.updateProject(projectId, { agents: project.agents });
  return { success: true };
});
```

**Step 2: 添加 preload 暴露**

```typescript
createAgent: (projectId: string, agent: Partial<Agent>) =>
  ipcRenderer.invoke('create-agent', projectId, agent),
deleteAgent: (projectId: string, agentId: string) =>
  ipcRenderer.invoke('delete-agent', projectId, agentId),
```

**Step 3: 添加 TypeScript 类型**

```typescript
createAgent: (projectId: string, agent: Partial<Agent>) => Promise<Agent | { error: string }>;
deleteAgent: (projectId: string, agentId: string) => Promise<{ success: boolean } | { error: string }>;
```

**Step 4: 在 AgentCanvas 中添加添加/删除按钮**

```typescript
// 添加按钮
<button onClick={handleAddAgent}>+ 添加 Agent</button>

// 删除按钮
<button onClick={() => handleDeleteAgent(agent.id)}>删除</button>
```

**Step 5: Commit**

```bash
git add src/main/ipc.ts src/main/preload.ts src/renderer/electron.d.ts src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 添加 Agent CRUD 功能"
```

---

## Task 4: 点击跳转终端会话

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 修改 onSelectAgent 实现**

```typescript
onSelectAgent={(agentId) => {
  // 找到该 Agent 对应的会话并激活
  const agent = currentProject?.agents.find(a => a.id === agentId);
  if (agent) {
    // 激活对应的终端会话
    // 可以通过状态管理或直接操作 Terminal 组件
    console.log('跳转到 Agent 会话:', agent.name);
  }
}}
```

**Step 2: 在 appStore 中添加会话管理**

```typescript
// appStore.ts
activeSessionId: string | null,
setActiveSessionId: (id: string | null) => void,
```

**Step 3: Commit**

```bash
git add src/renderer/App.tsx src/renderer/stores/appStore.ts
git commit -m "feat: 实现点击 Agent 跳转终端会话"
```

---

## Task 5: 构建验证

**Step 1: 构建**

```bash
npm run build
```

**Step 2: 验证**
- [ ] 面板宽度可拖拽调整
- [ ] 能力列表可编辑
- [ ] 可添加新 Agent
- [ ] 可删除 Agent
- [ ] 点击 Agent 卡片可跳转

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: 完成 Agent 画布功能修复"
```

---

## 执行方式

**Plan complete and saved to `docs/plans/2026-02-16-agent-canvas-fix-plan.md`. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing_plans, batch execution with checkpoints

**Which approach?**
