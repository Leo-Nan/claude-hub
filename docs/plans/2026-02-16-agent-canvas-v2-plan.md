# Agent Canvas V2 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**目标:** 将 Agent 面板改造为可视化画布，支持 Agent 卡片、关系连接线、拖拽排列

**架构:** 在现有 AgentCanvas 基础上重构，使用 SVG 绘制连接线，支持拖拽

**技术栈:** React + SVG + CSS Variables

---

## Task 1: 扩展数据类型

**Files:**
- Modify: `src/shared/types.ts`

**Step 1: 添加 AgentRelation 类型**

```typescript
// 扩展 Agent type
export type AgentType = 'researcher' | 'engineer' | 'reviewer' | 'planner' | 'coordinator';

// 添加关系类型
export type AgentRelationType = 'command' | 'dependency' | 'collaboration' | 'group';

export interface AgentRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: AgentRelationType;
}
```

**Step 2: Commit**

```bash
git add src/shared/types.ts
git commit -m "feat: 扩展 Agent 类型和添加关系类型"
```

---

## Task 2: 创建可视化 Agent 卡片组件

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 重构 AgentCanvas 为画布布局**

```typescript
// 卡片组件
const AgentCard: React.FC<{
  agent: Agent;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onDrag: (x: number, y: number) => void;
}> = ({ agent, x, y, isSelected, onSelect, onDoubleClick, onDrag }) => {
  // 卡片样式
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 140,
        padding: 12,
        backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
        border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
        borderRadius: 8,
        cursor: 'pointer',
      }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      {/* 状态点 */}
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        backgroundColor: STATUS_COLORS[agent.status],
      }} />
      {/* 名称 */}
      <span>{agent.name}</span>
      {/* 类型标签 */}
      <span>{TYPE_LABELS[agent.type]}</span>
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 创建可视化 Agent 卡片组件"
```

---

## Task 3: 实现关系连接线 (SVG)

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加 SVG 连接线组件**

```typescript
// 连接线组件
const ConnectionLine: React.FC<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: AgentRelationType;
}> = ({ sourceX, sourceY, targetX, targetY, type }) => {
  const getStrokeStyle = () => {
    switch (type) {
      case 'command': return { strokeDasharray: 'none', markerEnd: 'url(#arrow)' };
      case 'dependency': return { strokeDasharray: '5,5', markerEnd: 'url(#arrow)' };
      case 'collaboration': return { strokeDasharray: '2,2', markerEnd: 'none' };
      default: return { strokeDasharray: '5,5' };
    }
  };

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--text-muted)" />
        </marker>
      </defs>
      <line
        x1={sourceX + 70}
        y1={sourceY + 20}
        x2={targetX}
        y2={targetY + 20}
        stroke="var(--text-muted)"
        strokeWidth={2}
        {...getStrokeStyle()}
      />
    </svg>
  );
};
```

**Step 2: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 实现关系连接线"
```

---

## Task 4: 实现拖拽功能

**Files:**
- Modify: `src/renderer/components/AgentCanvas.tsx`

**Step 1: 添加拖拽状态和处理**

```typescript
// 拖拽状态
const [draggingId, setDraggingId] = useState<string | null>(null);
const [agentPositions, setAgentPositions] = useState<Record<string, { x: number; y: number }>>({});

// 初始化位置（如果没有）
useEffect(() => {
  const positions: Record<string, { x: number; y: number }> = {};
  agents.forEach((agent, index) => {
    if (!agentPositions[agent.id]) {
      positions[agent.id] = { x: 20 + (index % 3) * 160, y: 20 + Math.floor(index / 3) * 100 };
    }
  });
  if (Object.keys(positions).length > 0) {
    setAgentPositions(prev => ({ ...prev, ...positions }));
  }
}, [agents]);

// 拖拽处理
const handleDragStart = (agentId: string) => setDraggingId(agentId);
const handleDragEnd = () => setDraggingId(null);
const handleDragMove = (e: MouseEvent) => {
  if (draggingId) {
    setAgentPositions(prev => ({
      ...prev,
      [draggingId]: { x: e.clientX - 800, y: e.clientY - 100 } // 需要根据面板位置调整
    }));
  }
};
```

**Step 2: Commit**

```bash
git add src/renderer/components/AgentCanvas.tsx
git commit -m "feat: 实现拖拽排列功能"
```

---

## Task 5: 添加 Agent 类型到 IPC

**Files:**
- Modify: `src/main/ipc.ts`
- Modify: `src/main/preload.ts`
- Modify: `src/renderer/electron.d.ts`

**Step 1: 确保 create-agent 支持新类型**

```typescript
// ipc.ts - create-agent 已有的类型会自动支持新类型
// 确保 Agent 类型已更新
```

**Step 2: Commit**

```bash
git add src/main/ipc.ts src/main/preload.ts src/renderer/electron.d.ts
git commit -m "chore: 确保新 Agent 类型支持"
```

---

## Task 6: 构建验证

**Step 1: 构建**

```bash
npm run build
```

**Step 2: 验证**
- [ ] Agent 卡片显示在画布上
- [ ] 关系连接线正确显示
- [ ] 卡片可以拖拽
- [ ] 点击选中显示详情
- [ ] 双击跳转到终端

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: 完成 Agent Canvas V2"
```

---

## 执行方式

**Plan complete and saved to `docs/plans/2026-02-16-agent-canvas-v2-plan.md`. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing_plans, batch execution with checkpoints

**Which approach?**
