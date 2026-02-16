#!/bin/bash
# Claude Hub 自动检查脚本
# 用法: ./check.sh

echo "🔍 Claude Hub 自动检查..."
echo "================================"

# 1. 构建检查
echo ""
echo "📦 步骤1: 构建验证"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，需要修复"
fi

# 2. 代码质量检查
echo ""
echo "🔍 步骤2: 代码质量检查"
# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  有未提交的更改"
    git status --short
else
    echo "✅ 工作区干净"
fi

# 3. 检查已知问题
echo ""
echo "🧩 步骤3: 检查已知问题"

# 检查 TypeScript 错误
npx tsc --noEmit 2>&1 | head -20

# 4. 生成报告
echo ""
echo "================================"
echo "📊 检查完成"
echo ""
echo "如果上面显示 ❌ 或警告，请运行以下命令查看详情:"
echo "  npm run build    - 查看构建错误"
echo "  git status       - 查看未提交的更改"
echo "  git diff         - 查看具体更改"
