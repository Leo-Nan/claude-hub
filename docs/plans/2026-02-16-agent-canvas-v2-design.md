# Agent Canvas 设计文档

**日期**: 2026-02-16

## 核心理念

Agent 是**独立的配置单元**，关系是**可选的连接**。画布用于组织和反映 Agent 之间的真实协作关系。

## 数据结构

### Agent 配置单元

```typescript
interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'engineer' | 'reviewer' | 'planner' | 'coordinator';
  skills: string[];
  status: 'active' | 'idle' | 'thinking';
  rules?: string;
  systemPrompt?: string;
}
```

### 关系类型

```typescript
type AgentRelationType = 'command' | 'dependency' | 'collaboration' | 'group';

interface AgentRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: AgentRelationType;
}
```

## UI 设计

### 布局

```
┌─────────────────────────────────────────────────────────────────┐
│  Agent Canvas                                      [+ 添加 Agent]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌──────────┐           ┌──────────┐                        │
│    │ ● Researcher │ ─────▶ │ ● Engineer │                        │
│    │ 收集信息  │           │  实现代码  │                        │
│    └──────────┘           └──────────┘                        │
│           │                     │                              │
│           └──────────┬──────────┘                              │
│                      ▼                                          │
│            ┌──────────────┐                                   │
│            │ ● Reviewer   │                                    │
│            │  审查代码    │                                    │
│            └──────────────┘                                   │
│                                                                  │
│  分组: [Planner] [Researcher, Engineer] [Reviewer]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 交互方式

1. **卡片** - 显示 Agent 名称、类型、状态
2. **连接线** - 表示关系类型（实线=指挥，虚线=依赖）
3. **分组** - 用虚线框表示分组
4. **拖拽** - 可以拖动卡片位置
5. **点击** - 选中显示详情/编辑
6. **双击** - 跳转到终端会话

### 关系线样式

- **指挥 (command)**: 实线箭头 →
- **依赖 (dependency)**: 虚线箭头 - - →
- **协作 (collaboration)**: 双点线 ⇄
- **分组 (group)**: 虚线框包围

## 功能列表

1. **Agent 卡片** - 显示状态、类型、名称
2. **关系连接** - 用线表示 Agent 间关系
3. **添加/删除 Agent**
4. **配置编辑** - 点击卡片编辑配置
5. **点击跳转** - 双击跳转到终端
6. **拖拽排列** - 可调整位置

## 实现计划

见 `docs/plans/2026-02-16-agent-canvas-v2-plan.md`
