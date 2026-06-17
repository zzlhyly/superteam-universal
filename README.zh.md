# Superteam for OpenCode & Cursor

<div align="center">

### 面向 AI 驱动开发的多代理编排系统

*改编自 Claude Code 的原版 [Superteam](https://github.com/Crysple/superteam)*

[![Original Superteam](https://img.shields.io/badge/Original-Superteam-blue?style=flat-square)](https://github.com/Crysple/superteam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Built for OpenCode](https://img.shields.io/badge/OpenCode-Supported-green?style=flat-square)](.opencode/)
[![Built for Cursor](https://img.shields.io/badge/Cursor-Supported-purple?style=flat-square)](.cursor/)

**语言 / Language:** [English](README.md) · [中文](README.zh.md)

</div>

---

这是 [Superteam](https://github.com/Crysple/superteam) 多代理编排系统的**多平台适配版本**，最初为 Claude Code 的团队模式设计。核心概念（合同门控验证、对抗性反馈循环、5 阶段流水线）在适配到 OpenCode 和 Cursor 的过程中得以保留。

## 支持的平台

| 平台 | 目录 | 入口点 | 状态 |
|------|------|--------|------|
| **OpenCode** | `.opencode/superteam/` | `SKILL.md` | ✅ 完全支持 |
| **Cursor** | `.cursor/superteam/` | `SKILL.md` | ✅ 完全支持 |

## 概述

Superteam 生成一组专业代理来处理复杂任务：

- **PM（产品经理）** - 与用户进行需求收集
- **Architect（架构师）** - 规划和合同创建
- **Manager（经理）** - 执行监控和异常检测
- **Generator（生成器）** - 按合同实现
- **Evaluator（评估器）** - 4 层门控验证
- **Explorer（探索者）** - 代码库研究
- **Curator（策展人）** - 知识提取

## 快速开始

### OpenCode 使用

1. 将 `.opencode/superteam/` 复制到你的 OpenCode 技能目录：
   ```bash
   # Windows
   xcopy /E /I .opencode\superteam %USERPROFILE%\.opencode\skills\superteam
   
   # Linux/macOS
   cp -r .opencode/superteam ~/.opencode/skills/
   ```

2. 调用技能：
   ```
   /superteam 构建一个带 Redis 和死信队列的限流任务队列
   ```

### Cursor 使用

1. 将 `.cursor/` 复制到你的项目根目录：
   ```bash
   # Windows
   xcopy /E /I .cursor %USERPROFILE%\your-project\.cursor
   
   # Linux/macOS
   cp -r .cursor /path/to/your/project/
   ```

2. 启动 Superteam 会话，告诉 AI：
   ```
   读取 .cursor/superteam/SKILL.md 并启动一个 Superteam 会话：[你的任务]
   ```

## 架构

```
用户请求
    ↓
SKILL.md（入口点）
    ↓
Orchestrator（主编排代理）
    ↓
┌───────┬───────┬───────┬───────┐
│  PM   │ Arch  │ Mgr   │ Exp   │
└───┬───┘└───┬───┘└───┬───┘└───────┘
    │        │        │
    ↓        ↓        ↓
         Generator ←→ Evaluator
         （每个增量）
```

## 与原版的主要差异

| 方面 | 原版（Claude Code） | OpenCode 适配 | Cursor 适配 |
|------|---------------------|---------------|-------------|
| 代理隔离 | tmux 面板 | task() 调用 | 单代理上下文 |
| 通信方式 | SendMessage | 基于文件的消息 | 基于文件的消息 |
| 状态管理 | flock + CAS | 文件操作 | 文件操作 |
| 生命周期 | 持久代理 | 无状态任务 | 无状态任务 |
| 钩子 | PreToolUse/Stop | 技能工作流 | SKILL.md 引用 |
| 入口点 | 插件系统 | SKILL.md | SKILL.md |

## 目录结构

```
superteam/
├── .opencode/                    # OpenCode 版本
│   └── superteam/
│       ├── SKILL.md              # 入口点
│       ├── global-guide.md       # 共享规则
│       ├── agents/               # 代理定义
│       ├── task-forms/           # 任务表单定义
│       ├── scripts/              # 工具脚本
│       └── docs/                 # 文档
│
├── .cursor/                      # Cursor 版本
│   └── superteam/
│       ├── SKILL.md              # 入口点
│       ├── global-guide.md       # 共享规则
│       ├── agents/               # 代理定义
│       ├── task-forms/           # 任务表单定义
│       ├── scripts/              # 工具脚本
│       └── docs/                 # 文档
│
├── README.md                     # 英文说明文档
├── README.zh.md                  # 中文说明文档
├── LICENSE                       # MIT 许可证
└── .gitignore                    # Git 忽略规则
```

## 使用示例

### 基本使用

```
/superteam 构建一个带认证的用户管理 REST API
```

### 具体需求

```
/superteam 创建一个限流任务队列：
- Redis 后端
- 死信队列
- 指数退避重试逻辑
- 监控仪表板
- 目标：1000 任务/秒
```

### 企业场景

```
/superteam 添加一个每日 PySpark 作业：
- 连接 /data/prod/events 和 feature_flags 表
- 将分区输出落地到 /out/daily/features/
- 在 Airflow 中调度并设置重试
- SLA 违规时告警 #data-oncall
```

## 工作原理

### 阶段 1：PM

- PM 探索你的代码库
- 提出澄清问题
- 生成带验收门的 spec.md
- 你在任何构建工作之前批准

### 阶段 2：Architect

- 读取已批准的规范
- 分解为增量
- 创建带门控脚本的合同
- 生成 plan.md

### 阶段 3：Execute

对于每个增量：
1. Generator 按合同实现
2. Evaluator 用门控验证
3. 如有问题：修订并重新评估
4. 如批准：进行下一个

### 阶段 4：严格评估

- 新的评估器运行所有最终门控
- 二元结果：通过或失败
- 如失败：返回阶段 3 修复

### 阶段 5：交付

- Curator 提取知识到 wiki
- 向用户展示结果
- 知识可用于未来会话

## 工具

### 状态管理器

```bash
# 初始化
node .opencode/superteam/scripts/state-manager.js init  # OpenCode
node .cursor/superteam/scripts/state-manager.js init     # Cursor

# 获取值
node .opencode/superteam/scripts/state-manager.js get .phase  # OpenCode
node .cursor/superteam/scripts/state-manager.js get .phase     # Cursor

# 设置值
node .opencode/superteam/scripts/state-manager.js set phase=architect  # OpenCode
node .cursor/superteam/scripts/state-manager.js set phase=architect     # Cursor

# 显示状态
node .opencode/superteam/scripts/state-manager.js status  # OpenCode
node .cursor/superteam/scripts/state-manager.js status     # Cursor
```

### 消息总线

```bash
# 发送消息
node .opencode/superteam/scripts/message-bus.js send pm orchestrator phase_complete "规范已批准"

# 接收消息
node .opencode/superteam/scripts/message-bus.js receive orchestrator

# 列出待处理
node .opencode/superteam/scripts/message-bus.js list
```

### 门控运行器

```bash
# 运行增量 1 的门控
node .opencode/superteam/scripts/gate-runner.js run 1

# 运行最终门控
node .opencode/superteam/scripts/gate-runner.js final

# 列出可用门控
node .opencode/superteam/scripts/gate-runner.js list 1
```

### 事件记录器

```bash
# 记录决策
node .opencode/superteam/scripts/record-event.js \
  --actor orchestrator \
  --type decision \
  --summary "阶段转换" \
  --rationale "所有增量完成"

# 查询事件
node .opencode/superteam/scripts/record-event.js query --type decision
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

在 `.superteam/scripts/increment-N/` 中创建门控脚本：

```javascript
// gate-01-custom.js
const assert = require('assert');

async function test() {
  // 你的验证逻辑
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

## 限制

1. **无持久代理** - 每个任务都是无状态的
2. **无直接通信** - 所有路由通过编排器
3. **无 tmux 隔离** - 任务共享文件系统
4. **平台依赖** - 某些脚本可能需要适配

## 故障排除

### 无进展

检查状态：
```bash
# OpenCode
node .opencode/superteam/scripts/state-manager.js status

# Cursor
node .cursor/superteam/scripts/state-manager.js status
```

### 代理卡住

检查事件：
```bash
# OpenCode
node .opencode/superteam/scripts/record-event.js query --limit 10

# Cursor
node .cursor/superteam/scripts/record-event.js query --limit 10
```

### 门控失败

检查结果：
```bash
cat .superteam/gate-results/increment-1.json
```

## 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行修改
4. 充分测试
5. 提交 Pull Request

## 许可证

MIT 许可证 - 详见 LICENSE 文件

## 致谢与归属

本项目是 [Crysple](https://github.com/Crysple) 的 [Superteam](https://github.com/Crysple/superteam) 的适配版本，采用 [MIT 许可证](https://github.com/Crysple/superteam/blob/main/LICENSE)。

### 原始项目

- **仓库**：[github.com/Crysple/superteam](https://github.com/Crysple/superteam)
- **作者**：Crysple
- **许可证**：MIT
- **博客**：[English](https://crysple.github.io/superteam/index.html) | [中文](https://crysple.github.io/superteam/index.zh.html)

### 保留的核心设计原则

来自原版 Superteam 的核心设计原则：

1. **分离生成与评估** - 自我评估本质上是宽松的
2. **合同门控验证** - 可执行的验收标准，而非主观判断
3. **对抗性反馈循环** - Generator/Evaluator 配对进行盲评
4. **渐进式上下文** - 经验教训在多次尝试中积累
5. **知识提取** - Curator 将发现提升到全局 wiki

### 变更内容

适配 OpenCode 和 Cursor：

| 方面 | 原版（Claude Code） | OpenCode 适配 | Cursor 适配 |
|------|---------------------|---------------|-------------|
| 代理隔离 | tmux 面板 | `task()` 调用 | 单代理上下文 |
| 通信方式 | `SendMessage` | 基于文件的消息 | 基于文件的消息 |
| 状态管理 | `flock` + CAS | 文件操作 | 文件操作 |
| 生命周期 | 持久代理 | 无状态任务 | 无状态任务 |
| 钩子 | PreToolUse/Stop | 技能工作流 | SKILL.md 引用 |
| 平台 | 仅 Linux/macOS | 跨平台 | 跨平台 |

### 致谢

特别感谢：
- [Crysple](https://github.com/Crysple) 创建了原版 Superteam
- [Anthropic](https://www.anthropic.com/) 的 Claude Code 团队模式架构
- [Andrej Karpathy](https://github.com/karpathy) 的 [LLM Wiki 模式](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 灵感
