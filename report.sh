#!/bin/bash
# Claude Hub 定期改进报告生成器
# 用法: ./report.sh

echo "📊 Claude Hub 定期改进报告"
echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
echo ""

# 1. 项目状态
echo "📁 项目状态"
echo "---------------"
echo "分支: $(git branch --show-current)"
echo "最新提交: $(git log -1 --oneline)"
echo ""

# 2. 代码统计
echo "📈 代码统计"
echo "---------------"
echo "总文件数: $(find src -name '*.ts' -o -name '*.tsx' | wc -l)"
echo "总代码行数: $(find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1)"
echo ""

# 3. 功能模块清单
echo "🎯 功能模块"
echo "---------------"
echo "• Terminal: $(grep -l 'Terminal' src/renderer/components/*.tsx | wc -l) 个组件"
echo "• Sidebar: $(grep -l 'Sidebar' src/renderer/components/*.tsx | wc -l) 个组件"
echo "• Agent: $(grep -l 'Agent' src/renderer/components/*.tsx | wc -l) 个组件"
echo "• UI 组件: $(grep -c 'export.*Component' src/renderer/components/ui/index.tsx 2>/dev/null || echo 0) 个"
echo ""

# 4. 待办事项检查
echo "📋 近期改进记录"
echo "---------------"
git log --oneline -10 --format="  %h %s"
echo ""

# 5. 可能需要关注的问题
echo "🔍 需要关注"
echo "---------------"

# 检查是否有 TODO 注释
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK" src --include="*.ts" --include="*.tsx" | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo "⚠️  发现 $TODO_COUNT 个 TODO/FIXME 注释"
    grep -r "TODO\|FIXME\|HACK" src --include="*.ts" --include="*.tsx" | head -5
else
    echo "✅ 无待办注释"
fi
echo ""

# 6. 建议改进项
echo "💡 建议改进项"
echo "---------------"
echo "根据当前代码分析，建议以下改进:"
echo ""
echo "  [1] Terminal 阶段三 - 搜索和导出功能"
echo "  [2] 项目功能 - 分组/标签/收藏"
echo "  [3] 系统集成 - 快捷键全局化/系统托盘"
echo "  [4] 性能优化 - 大文件树懒加载"
echo ""

echo "================================"
echo "报告完成 ✨"
echo ""
echo "运行 './dev.sh' 开始开发模式测试"
