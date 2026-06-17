# Superteam for OpenCode, Cursor & Claude Code

<div align="center">

### 面向 AI 驱动开发的多代理编排系统

*改编自 Claude Code 的原版 [Superteam](https://github.com/Crysple/superteam)*

[![Original Superteam](https://img.shields.io/badge/Original-Superteam-blue?style=flat-square)](https://github.com/Crysple/superteam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Built for OpenCode](https://img.shields.io/badge/OpenCode-Supported-green?style=flat-square)](.opencode/)
[![Built for Cursor](https://img.shields.io/badge/Cursor-Supported-purple?style=flat-square)](.cursor/)
[![Built for Claude](https://img.shields.io/badge/Claude-Supported-orange?style=flat-square)](.claude/)

**语言 / Language:** [English](README.md) · [中文](README.zh.md)

</div>

---

这是 [Superteam](https://github.com/Crysple/superteam) 多代理编排系统的**多平台适配版本**，最初为 Claude Code 的团队模式设计。核心概念（合同门控验证、对抗性反馈循环、5 阶段流水线）在适配到 OpenCode、Cursor 和 Claude Code 的过程中得以保留。

## 支持的平台

| 平台 | 目录 | 状态 |
|------|------|------|
| **Cursor** | `.cursor/` | ✅ 完全支持 |
| **OpenCode** | `.opencode/` | ✅ 完全支持 |
| **Claude Code** | `.claude/superteam/` | ✅ 原版 |

## 概述

Superteam 生成一组专业代理来处理复杂任务：

- **PM（产品经理）** - 与用户进行需求收集
- **Architect（架构师）** - 规划和合同创建
- **Manager（经理）** - 执行监控和异常检测
- **Generator（生成器）** - 按合同实现
- **Evaluator（评估器）** - 4 层门控验证
- **Plan Evaluator（计划评估器）** - 独立计划验证
- **Explorer（探索者）** - 代码库研究
- **Curator（策展人）** - 知识提取

## 快速开始

### Cursor 使用

将 `.cursor/` 复制到你的项目根目录：

```bash
# Windows
xcopy /E /I .cursor your-project\.cursor

# Linux/macOS
cp -r .cursor /path/to/your/project/
```

然后使用命令或子代理：

```
/superteam 构建一个带 Redis 和死信队列的限流任务队列
@orchestrator 协调实现
@pm 收集这个功能的需求
```

### OpenCode 使用

将 `.opencode/` 复制到你的项目根目录：

```bash
# Windows
xcopy /E /I .opencode your-project\.opencode

# Linux/macOS
cp -r .opencode /path/to/your/project/
```

然后调用技能：

```
/superteam 构建一个带 Redis 和死信队列的限流任务队列
```

### Claude Code 使用（原版）

将 `.claude/superteam/` 复制到你的 Claude Code 插件目录：

```bash
# Windows
xcopy /E /I .claude\superteam %USERPROFILE%\.claude\plugins\superteam

# Linux/macOS
cp -r .claude/superteam ~/.claude/plugins/
```

或通过 Claude Code 插件系统安装：

```
/plugin marketplace add Crysple/superteam
/plugin install superteam@superteam
/reload-plugins
```

## 架构

```
用户请求
    ↓
SKILL.md / Command（入口点）
    ↓
Orchestrator（主编排代理）
    ↓
┌──────┬──────┬──────┬──────┬──────────────┐
│  PM  │ Arch │ Mgr  │ Exp  │ Plan-Eval    │
└──┬───┘└──┬──┘└──┬──┘└─────┘└──────────────┘
   │       │      │
   ↓       ↓      ↓
        Generator ←→ Evaluator
        （每个增量）
              ↓
          Curator（阶段 5）
```

## 与原版的主要差异

| 方面 | 原版（Claude Code） | Cursor 适配 | OpenCode 适配 |
|------|---------------------|-------------|---------------|
| 代理隔离 | tmux 面板 | `.cursor/agents/*.md` 子代理 | `.opencode/agents/*.md` 子代理 |
| 通信方式 | SendMessage | 基于文件的消息 | 基于文件的消息 |
| 状态管理 | flock + CAS | 文件操作 | 文件操作 |
| 生命周期 | 持久代理 | 无状态任务 + Hooks | 无状态任务 + 插件 |
| 钩子 | PreToolUse/Stop | `.cursor/hooks.json` | `.opencode/plugins/*.js` |
| 规则 | 插件配置 | `.cursor/rules/*.mdc` | SKILL.md |
| 命令 | 插件命令 | `.cursor/commands/*.md` | `/superteam` 触发 |
| 平台 | 仅 Linux/macOS | 跨平台 | 跨平台 |

## 目录结构

```
superteam-universal/
├── .cursor/                         # Cursor 版本
│   ├── rules/                       # 项目规则（.mdc，始终应用）
│   ├── agents/                      # 子代理（自动发现）
│   │   ├── orchestrator.md, pm.md, architect.md
│   │   ├── generator.md, evaluator.md, manager.md
│   │   └── explorer.md, plan-evaluator.md, curator.md
│   ├── skills/superteam/            # 技能入口 + 脚本
│   │   ├── SKILL.md, scripts/, phases/
│   ├── commands/superteam.md        # /superteam 命令
│   └── hooks.json                   # 钩子配置
│
├── .opencode/                       # OpenCode 版本
│   ├── agents/                      # 子代理（自动发现）
│   │   ├── orchestrator.md, pm.md, architect.md
│   │   ├── generator.md, evaluator.md, manager.md
│   │   └── explorer.md, plan-evaluator.md, curator.md
│   ├── skills/superteam/            # 技能入口 + 脚本
│   │   ├── SKILL.md, scripts/, phases/
│   │   ├── global-guide.md, task-forms/
│   ├── plugins/superteam-hooks.js   # 安全钩子插件
│   └── opencode.json                # OpenCode 配置
│
├── .claude/superteam/               # Claude Code 版本（原版）
└── AGENTS.md, README.md, README.zh.md, LICENSE
```

## 工作原理

### 阶段 1：PM（交互式）

- Explorer 调查代码库并构建知识库
- PM 基于发现提出澄清问题
- 生成带可执行验收门的 `spec.md`
- 你在任何构建工作之前批准

### 阶段 2：Architect（自动化）

- 读取已批准的规范
- 分解为带冻结合同的增量
- 为每个增量创建门控脚本
- Plan Evaluator 独立验证计划覆盖度

### 阶段 3：Execute（经理驱动）

对于每个增量：
1. Generator 按合同实现
2. Evaluator 运行 4 层验证（前置条件 → 硬门控 → 软门控 → 不变量）
3. 如 REVISE：修复并重新评估
4. 如 APPROVED：进行下一个

### 阶段 4：严格评估（强制）

- 新的评估器运行所有最终门控
- 二元结果：通过或失败
- 如失败：带渐进式上下文返回阶段 3

### 阶段 5：交付（终结）

- Curator 提取知识到全局 wiki（`~/.superteam/`）
- 向用户展示结果

## 工具

### 状态管理器

```bash
# Cursor
node .cursor/skills/superteam/scripts/state-manager.js init
node .cursor/skills/superteam/scripts/state-manager.js get .phase
node .cursor/skills/superteam/scripts/state-manager.js set phase=architect
node .cursor/skills/superteam/scripts/state-manager.js status

# OpenCode
node .opencode/skills/superteam/scripts/state-manager.js init
node .opencode/skills/superteam/scripts/state-manager.js get .phase
node .opencode/skills/superteam/scripts/state-manager.js set phase=architect
node .opencode/skills/superteam/scripts/state-manager.js status
```

### 门控运行器

```bash
# Cursor
node .cursor/skills/superteam/scripts/gate-runner.js run 1
node .cursor/skills/superteam/scripts/gate-runner.js final

# OpenCode
node .opencode/skills/superteam/scripts/gate-runner.js run 1
node .opencode/skills/superteam/scripts/gate-runner.js final
```

### 事件记录器

```bash
# Cursor
node .cursor/skills/superteam/scripts/record-event.js \
  --actor orchestrator --type decision --summary "阶段转换"

# OpenCode
node .opencode/skills/superteam/scripts/record-event.js \
  --actor orchestrator --type decision --summary "阶段转换"
```

## 自定义

### 添加新任务表单

创建 `task-forms/my-form/FORM.md`：

```yaml
---
name: "my-form"
description: "自定义工作流"
phases: [pm, architect, execute, deliver]
termination: "所有任务完成"
---
```

### 自定义门控脚本

门控脚本在执行期间创建于 `.superteam/scripts/increment-N/`：

```javascript
// gate-01-custom.js
const assert = require('assert');

async function test() {
  const result = await checkSomething();
  assert(result.success, '检查应该通过');
}

test().then(() => {
  console.log('PASS');
  process.exit(0);
}).catch(err => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
```

## 故障排除

### 无进展

```bash
# 检查状态
node .cursor/skills/superteam/scripts/state-manager.js status     # Cursor
node .opencode/skills/superteam/scripts/state-manager.js status    # OpenCode
```

### 代理卡住

```bash
# 检查最近事件
node .cursor/skills/superteam/scripts/record-event.js query --limit 10    # Cursor
node .opencode/skills/superteam/scripts/record-event.js query --limit 10  # OpenCode
```

### 门控失败

```bash
# 检查门控结果（平台无关）
cat .superteam/gate-results/increment-1.json
```

### Cursor 专属

```bash
ls .cursor/agents/       # 检查子代理文件是否存在
ls .cursor/commands/      # 检查命令文件是否存在
cat .cursor/hooks.json    # 检查钩子配置
```

## 限制

1. **无持久代理** - 每个任务都是无状态的
2. **无直接通信** - 所有路由通过编排器
3. **无 tmux 隔离** - 任务共享文件系统

## 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行修改
4. 充分测试
5. 提交 Pull Request

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢与归属

本项目是 [Crysple](https://github.com/Crysple) 的 [Superteam](https://github.com/Crysple/superteam) 的适配版本，采用 [MIT 许可证](https://github.com/Crysple/superteam/blob/main/LICENSE)。

### 原始项目

- **仓库**：[github.com/Crysple/superteam](https://github.com/Crysple/superteam)
- **作者**：Crysple
- **许可证**：MIT
- **博客**：[English](https://crysple.github.io/superteam/index.html) | [中文](https://crysple.github.io/superteam/index.zh.html)

### 保留的核心设计原则

1. **分离生成与评估** - 自我评估本质上是宽松的
2. **合同门控验证** - 可执行的验收标准，而非主观判断
3. **对抗性反馈循环** - Generator/Evaluator 配对进行盲评
4. **渐进式上下文** - 经验教训在多次尝试中积累
5. **知识提取** - Curator 将发现提升到全局 wiki

### 致谢

- [Crysple](https://github.com/Crysple) 创建了原版 Superteam
- [Anthropic](https://www.anthropic.com/) 的 Claude Code 团队模式架构
- [Andrej Karpathy](https://github.com/karpathy) 的 [LLM Wiki 模式](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 灵感
