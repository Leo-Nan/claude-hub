#!/bin/bash
# Claude Hub 一键检查与开发脚本
# 用法:
#   ./dev.sh          - 交互式菜单
#   ./dev.sh check    - 仅检查
#   ./dev.sh report   - 生成报告
#   ./dev.sh dev      - 启动开发模式
#   ./dev.sh build    - 构建

case "$1" in
    check)
        echo "🔍 执行检查..."
        npm run build
        ;;
    report)
        bash report.sh
        ;;
    dev)
        echo "🚀 启动开发模式..."
        npm run dev
        ;;
    build)
        echo "📦 构建项目..."
        npm run build
        ;;
    *)
        echo "📋 Claude Hub 开发工具"
        echo ""
        echo "用法: ./dev.sh [command]"
        echo ""
        echo "命令:"
        echo "  check   - 检查构建和代码质量"
        echo "  report  - 生成改进报告"
        echo "  dev     - 启动开发模式"
        echo "  build   - 构建生产版本"
        echo ""
        echo "示例:"
        echo "  ./dev.sh report   # 生成报告查看改进建议"
        echo "  ./dev.sh check    # 快速检查是否有问题"
        ;;
esac
