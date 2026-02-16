# 项目管理器 (Sidebar) 改进设计

## 1. 当前状态分析

### 现有功能
- 项目列表展示（固定宽度 240px）
- 项目搜索过滤
- 键盘导航（上下箭头选择，回车确认）
- 右键菜单删除
- 悬停显示删除按钮
- 项目显示 Agent 数量 badge

### 存在的问题
1. **信息展示不足** - 只显示项目名称和路径，信息单一
2. **缺少文件树** - 用户看不到项目内部结构
3. **交互单调** - 缺少文件/目录图标、展开收起
4. **无拖拽排序** - 无法调整项目顺序
5. **缺少快捷操作** - 无法快速打开文件夹、复制路径等

---

## 2. 设计目标

参考 VSCode、GitHub Desktop、IntelliJ 等 IDE 的文件管理器设计：

### 核心功能
- [ ] 显示项目文件树结构（目录展开/收起）
- [ ] 文件/目录图标区分
- [ ] 文件右键菜单（打开、复制路径、在资源管理器中显示）
- [ ] 拖拽调整项目顺序
- [ ] 项目设置快捷入口
- [ ] 面包屑导航（可选）

### 视觉设计
- [ ] 现代文件树缩进视觉（→ 展开后变为 ▼）
- [ ] 文件类型图标（文件夹、代码文件、图片等）
- [ ] 当前选中状态高亮
- [ ] 悬停效果
- [ ] 平滑动画过渡

---

## 3. 架构设计

### 组件结构

```
Sidebar
├── Header (项目标题 + 搜索框 + 添加按钮)
├── ProjectList
│   └── ProjectItem (可拖拽)
│       ├── ProjectInfo (名称、路径、Agent数量)
│       ├── FileTree (可选展开)
│       │   └── TreeNode (递归)
│       └── Actions (删除按钮等)
└── Footer (状态信息)
```

### 数据结构

```typescript
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  expanded?: boolean;
}

interface Project {
  id: string;
  name: string;
  path: string;
  agents: Agent[];
  // 新增
  files?: FileNode[];      // 文件树
  lastOpened?: number;     // 最近打开时间
  isLoading?: boolean;    // 加载状态
}
```

### IPC 通信

```typescript
// 新增 IPC
ipcMain.handle('get-project-files', (event, projectPath: string) => {
  // 递归读取目录结构
});

ipcMain.handle('open-in-explorer', (event, path: string) => {
  // 系统资源管理器打开
});

ipcMain.handle('copy-path', (event, path: string) => {
  // 复制路径到剪贴板
});
```

---

## 4. 分阶段实现

### Phase 1: 基础增强
- 扩展项目信息展示（添加图标、最近打开时间）
- 拖拽排序支持
- 项目快捷操作菜单

### Phase 2: 文件树集成
- 读取项目文件结构
- 目录展开/收起
- 文件图标映射

### Phase 3: 高级功能
- 文件搜索
- 快速打开
- 性能优化（大数据目录懒加载）

---

## 5. 界面设计示意

```
┌─────────────────────────────────┐
│ 🔍 搜索项目...           + 新建 │
├─────────────────────────────────┤
│ 📁 ClaudeHub-Config      ⭐    │ ← 项目（可拖拽）
│   ├─ src/                      │   ← 文件树（可选展开）
│   │   ├─ main/
│   │   └─ renderer/
│   └─ package.json
│                                  │
│ 📁 another-project        📊 2  │ ← 另一个项目
│   └─ src/
│                                  │
│ 📁 my-awesome-app         ⚡ 5  │
└─────────────────────────────────┘
```

---

## 6. 技术实现要点

1. **文件树读取** - 使用 Node.js fs 递归读取，设置深度限制
2. **图标映射** - 根据文件扩展名返回对应图标
3. **虚拟滚动** - 大项目使用 react-window 优化性能
4. **防抖搜索** - 文件搜索使用 debounce
5. **缓存** - 项目文件结构缓存，避免重复读取

---

## 7. 待确认问题

1. 文件树是否默认展开？还是需要用户手动点击？
2. 是否需要显示隐藏文件（如 .gitignore）？
3. 最大显示目录深度？
4. 是否需要支持右键 "Open in VSCode" 等操作？
