# Claude Hub 改进设计文档

**日期**: 2026-02-15
**状态**: 已批准

## 概述

对 Claude Hub 项目进行 UI/UX 改进和代码质量提升。

## 已识别的改进项

1. **自定义 Modal 组件** - 替代原生 confirm() 对话框
2. **空状态提示** - Sidebar 无项目时显示提示
3. **Dark 主题支持** - 使用 Zustand 状态管理
4. **样式提取** - 将内联样式移到 CSS 文件
5. **React 错误边界** - 添加全局错误处理
6. **项目路径验证** - ipc.ts 添加验证逻辑

## 设计方案

### 1. Modal 组件 (迭代 1)

- 创建 `src/renderer/components/Modal.tsx`
- 支持 title, message, confirmText, cancelText 属性
- 使用 React Portal 渲染到 body

### 2. 空状态提示 (迭代 1)

- 在 Sidebar 组件中添加条件渲染
- 当 projects.length === 0 时显示提示

### 3. Dark 主题 (迭代 2)

- 在 types.ts 中扩展 theme 类型: `'light' | 'dark'`
- 在 appStore.ts 中添加 theme 状态
- 使用 CSS 变量定义颜色，组件中使用 var(--xxx)
- 在 App.tsx 中根据 theme 应用不同 CSS 类

### 4. 样式提取 (迭代 3)

- 创建 `src/renderer/styles/components.css`
- 提取通用样式：按钮、容器、边框等

### 5. 错误边界 (迭代 3)

- 创建 `src/renderer/components/ErrorBoundary.tsx`
- 包裹 App 根组件

### 6. 项目路径验证 (迭代 3)

- 在 ipc.ts 中添加路径存在性检查
- 添加项目去重验证

## 实现顺序

1. 迭代 1: Modal + 空状态提示
2. 迭代 2: Dark 主题支持
3. 迭代 3: 样式提取 + 错误边界 + 路径验证
