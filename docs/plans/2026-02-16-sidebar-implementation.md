# 项目管理器改进实施计划

## 用户确认的需求

| 功能 | 选择 |
|------|------|
| 文件树 | 默认收起，点击展开 |
| 隐藏文件 | 全部显示 |
| 目录深度 | 3 层 |

---

## 实施步骤

### 步骤 1: 后端 - 添加文件读取 IPC

**修改文件:**
- `src/main/ipc.ts` - 添加 `get-project-files` 处理器
- `src/main/store.ts` - 可选

**功能:**
- 递归读取目录结构
- 支持深度限制（3层）
- 缓存结果

### 步骤 2: 前端 - 添加文件树组件

**新增文件:**
- `src/renderer/components/FileTree.tsx` - 文件树组件

**修改文件:**
- `src/renderer/components/Sidebar.tsx` - 集成文件树

### 步骤 3: 前端 - 项目信息增强

**修改 Sidebar:**
- 项目添加图标和最近打开时间
- 项目添加右键菜单（打开文件夹、复制路径、设置）
- 拖拽排序（简化版）

### 步骤 4: 整合测试

- 打包验证
- 功能测试

---

## 预期文件变更

```
src/main/
├── ipc.ts              [修改] 添加文件读取 IPC

src/renderer/components/
├── FileTree.tsx        [新增] 文件树组件
├── Sidebar.tsx         [修改] 集成文件树
└── ui/index.tsx        [修改] 添加 Tree 组件
```

---

## 启动实施

请确认是否开始实施？
