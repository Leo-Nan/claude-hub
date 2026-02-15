# Claude Hub 改进实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 对 Claude Hub 进行 UI/UX 改进和代码质量提升，包括 Modal 组件、空状态提示、Dark 主题、样式提取、错误边界等

**Architecture:** 渐进式实现，分3个迭代：
- 迭代 1: Modal + 空状态提示
- 迭代 2: Dark 主题
- 迭代 3: 样式提取 + 错误边界 + 路径验证

**Tech Stack:** React 18, TypeScript, Zustand, CSS Variables

---

## 迭代 1: Modal 组件 + 空状态提示

### Task 1: 创建 Modal 组件

**Files:**
- Create: `src/renderer/components/Modal.tsx`

**Step 1: 创建 Modal.tsx**

```tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        minWidth: '320px',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: '14px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: danger ? '#f44336' : '#2196f3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

**Step 2: 提交**

```bash
git add src/renderer/components/Modal.tsx
git commit -m "feat: 添加 Modal 组件"
```

---

### Task 2: 修改 Sidebar 使用 Modal

**Files:**
- Modify: `src/renderer/components/Sidebar.tsx`

**Step 1: 添加 Modal 状态和逻辑**

在 Sidebar.tsx 中添加：

```tsx
import React, { useState } from 'react';
// ... existing imports
import Modal from './Modal';

// 添加状态
const [modalOpen, setModalOpen] = useState(false);
const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

// 修改 handleContextMenu
const handleContextMenu = (e: React.MouseEvent, id: string) => {
  e.preventDefault();
  setProjectToDelete(id);
  setModalOpen(true);
};

const handleConfirmDelete = () => {
  if (projectToDelete) {
    onRemoveProject(projectToDelete);
  }
  setModalOpen(false);
  setProjectToDelete(null);
};

const handleCancelDelete = () => {
  setModalOpen(false);
  setProjectToDelete(null);
};

// 在 return 中添加 Modal 组件（在 Sidebar div 之前）
<Modal
  isOpen={modalOpen}
  title="删除项目"
  message="确定要删除此项目吗？此操作无法撤销。"
  confirmText="删除"
  cancelText="取消"
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
  danger
/>

// 修改 return 中的条件渲染，添加空状态
{projects.length === 0 ? (
  <div style={{ padding: '20px 12px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
    暂无项目<br />点击下方添加项目
  </div>
) : (
  projects.map((project) => (
    // ... existing map
  ))
)}
```

**Step 2: 提交**

```bash
git add src/renderer/components/Sidebar.tsx
git commit -m "feat: Sidebar 使用 Modal 替代 confirm，添加空状态提示"
```

---

## 迭代 2: Dark 主题支持

### Task 3: 修改类型定义

**Files:**
- Modify: `src/shared/types.ts:18-23`

**Step 1: 修改 AppConfig 类型**

```typescript
export interface AppConfig {
  theme: 'light' | 'dark';
  sidebarWidth: number;
  projects: Project[];
  currentProjectId: string | null;
}
```

**Step 2: 提交**

```bash
git add src/shared/types.ts
git commit -f "feat: 添加 dark 主题支持"
```

---

### Task 4: 修改 Zustand store

**Files:**
- Modify: `src/renderer/stores/appStore.ts`

**Step 1: 添加 theme 状态**

```typescript
interface AppState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  theme: 'light',
  // ... existing methods
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));
```

**Step 2: 提交**

```bash
git add src/renderer/stores/appStore.ts
git commit -f "feat: store 添加 theme 状态管理"
```

---

### Task 5: 创建主题 CSS 变量

**Files:**
- Create: `src/renderer/styles/theme.css`

**Step 1: 创建 CSS 文件**

```css
:root {
  /* Light 主题 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --accent-color: #2196f3;
  --success-color: #4caf50;
  --danger-color: #f44336;
  --hover-bg: #e3f2fd;
  --terminal-bg: #1e1e1e;
  --terminal-fg: #d4d4d4;
}

[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #3c3c3c;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #3c3c3c;
  --accent-color: #4fc3f7;
  --success-color: #81c784;
  --danger-color: #e57373;
  --hover-bg: #2d2d2d;
}
```

**Step 2: 提交**

```bash
git add src/renderer/styles/theme.css
git commit -f "feat: 添加 CSS 变量主题支持"
```

---

### Task 6: 修改 App 应用主题

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 添加主题逻辑**

```tsx
// 添加 theme 和 toggleTheme
const {
  // ... existing
  theme,
  toggleTheme,
} = useAppStore();

// 在 return 的最外层 div 添加 data-theme 属性
<div
  style={{ /* existing */ }}
  data-theme={theme}
>
```

**Step 2: 提交**

```bash
git add src/renderer/App.tsx
git commit -f "feat: App 应用主题设置"
```

---

### Task 7: 添加主题切换按钮

**Files:**
- Modify: `src/renderer/components/StatusBar.tsx`

**Step 1: 添加切换按钮**

```tsx
// 读取 theme 和 toggleTheme
const { theme, toggleTheme } = useAppStore();

// 在 return 中添加按钮
<button
  onClick={toggleTheme}
  style={{
    padding: '4px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '12px',
  }}
>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

**Step 2: 提交**

```bash
git add src/renderer/components/StatusBar.tsx
git commit -f "feat: StatusBar 添加主题切换按钮"
```

---

## 迭代 3: 样式提取 + 错误边界 + 路径验证

### Task 8: 创建 ErrorBoundary 组件

**Files:**
- Create: `src/renderer/components/ErrorBoundary.tsx`

**Step 1: 创建 ErrorBoundary.tsx**

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fff',
        }}>
          <h2 style={{ color: '#f44336' }}>出错了</h2>
          <p style={{ color: '#666' }}>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              marginTop: '16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Step 2: 提交**

```bash
git add src/renderer/components/ErrorBoundary.tsx
git commit -f "feat: 添加 ErrorBoundary 组件"
```

---

### Task 9: 在 App 中使用 ErrorBoundary

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 引入 ErrorBoundary**

```tsx
import ErrorBoundary from './components/ErrorBoundary';

// 包裹应用
<ErrorBoundary>
  <div data-theme={theme}>
    {/* existing content */}
  </div>
</ErrorBoundary>
```

**Step 2: 提交**

```bash
git add src/renderer/App.tsx
git commit -f "feat: App 使用 ErrorBoundary"
```

---

### Task 10: 添加项目路径验证

**Files:**
- Modify: `src/main/ipc.ts`

**Step 1: 修改 add-project 处理**

```typescript
// 添加 fs 导入
import * as fs from 'fs';

// 修改 add-project
ipcMain.handle('add-project', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const projectPath = result.filePaths[0];

  // 检查路径是否存在
  if (!fs.existsSync(projectPath)) {
    return { error: '路径不存在' };
  }

  const projectName = projectPath.split(/[\\/]/).pop() || 'Untitled';

  // 检查是否已存在相同路径的项目
  const existing = store.getProjects().find(p => p.path === projectPath);
  if (existing) {
    return { error: '该项目已存在' };
  }

  return store.addProject(projectName, projectPath);
});
```

**Step 2: 提交**

```bash
git add src/main/ipc.ts
git commit -f "feat: 添加项目路径验证和去重检查"
```

---

## 执行总结

| 迭代 | 任务数 | 主要文件 |
|------|--------|----------|
| 1 | 2 | Modal.tsx, Sidebar.tsx |
| 2 | 5 | types.ts, appStore.ts, theme.css, App.tsx, StatusBar.tsx |
| 3 | 3 | ErrorBoundary.tsx, App.tsx, ipc.ts |

**总计: 10 个任务**
