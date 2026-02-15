# ClaudeHub Config

Claude Hub 项目的配置文件集合

## 目录结构

```
ClaudeHub-Config/
├── docs/
│   └── design.md      # 设计文档
├── .claude/
│   ├── CLAUDE.md        # 私人秘书入口
│   ├── settings.json    # 全局设置
│   └── rules/
│       ├── researcher.md  # 调研模式
│       ├── decision.md   # 决策模式
│       ├── coder.md     # 编码模式
│       └── reviewer.md  # 审查模式
└── README.md
```

## 使用方式

在此目录中启动 Claude 进行开发：

```bash
cd ClaudeHub-Config
claude
```

## 模式切换

在对话中指定模式：

- "用调研模式帮我查一下..."
- "用决策模式分析..."
- "用编码模式实现..."

或者让 CLAUDE.md 自动判断。

## Skills

配置中引用了以下 Skills：

- superpowers:brainstorming
- superpowers:writing-plans
- superpowers:test-driven-development
- superpowers:systematic-debugging
- feature-dev
- pr-review-toolkit

确保已安装这些插件：
```
claude plugin install feature-dev@claude-plugins-official
claude plugin install pr-review-toolkit@claude-plugins-official
```
