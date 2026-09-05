# @te-river/opencode-gov-mode

一个用于 [OpenCode Desktop](https://opencode.ai) 的层级化多智能体插件，实现了帝国政府指挥结构。通过从皇帝到领域专家的15个专业化代理的结构化层级来协调复杂的编码任务。

## 特性

- **15个专业代理** — 皇帝、宰相、六部（吏部、户部、礼部、兵部、刑部、工部）、地方官、基层官员，以及5个专家（架构师、实现者、审查员、测试员、研究员）。
- **12个斜杠命令** — 从 `/gov-reign` 到各个专家调度的完整帝国工作流命令。
- **黑板协调** — 带有会话隔离和TTL自动清理的共享工件系统，用于代理间通信。
- **层级委派** — 可配置的最大深度，支持深度子代理嵌套。
- **会话隔离** — 每个任务都有自己独立的黑板，具有自动资源管理。
- **TypeScript** — 完全类型化的API，确保可靠的插件集成。

## 要求

- Node.js ≥ 18
- [OpenCode Desktop](https://opencode.ai)

## 安装

### npm（推荐）

```bash
npm install -g @te-river/opencode-gov-mode@latest
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.ps1 | iex
```

### 镜像站（中国大陆）

如果访问 GitHub 有问题，可以尝试这些镜像：

```bash
# macOS / Linux — ghproxy.net
curl -fsSL https://ghproxy.net/https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.sh | bash

# macOS / Linux — gh-proxy.com
curl -fsSL https://gh-proxy.com/https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.sh | bash
```

```powershell
# Windows (PowerShell) — ghproxy.net
irm https://ghproxy.net/https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.ps1 | iex

# Windows (PowerShell) — gh-proxy.com
irm https://gh-proxy.com/https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.ps1 | iex
```

### 手动安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/Te-River/Opencode-GovMode.git
   ```
2. 安装依赖：
   ```bash
   cd Opencode-GovMode
   npm install
   ```
3. 构建插件：
   ```bash
   npm run build
   ```
4. 链接插件用于本地开发：
   ```bash
   npm link
   ```

## 快速开始

安装后，OpenCode Desktop将自动检测插件。打开命令面板并开始新的政府会话：

```
/gov-reign 为API网关实现一个速率限制中间件
```

这会触发完整的帝国工作流：皇帝接收任务，委派给宰相进行协调，宰相通过相应的部门分配任务，最终地方官通过基层官员和专家协调实现。

## 代理层级

该插件模拟了一个层级化的帝国政府。每个层级可以委派给下一层级，形成一个处理子任务的代理树。

### 1. 皇帝（君主） — 最高决策者
- 接收顶级任务并做出最终架构决策
- 委派给宰相进行协调

### 2. 宰相（宰相） — 首席协调员
- 协调跨部门的工作
- 将任务路由到正确的领域
- 为皇帝汇总报告

### 3. 六部（六部） — 领域专家

| 部门 | 中文 | 职责 |
|------|------|------|
| 吏部 | 吏部 | 代理分配和人力资源相关事务 |
| 户部 | 户部 | 资源预算、成本分析和优化 |
| 礼部 | 礼部 | 代码规范、文档和标准 |
| 兵部 | 兵部 | 安全、威胁建模和防御性设计 |
| 刑部 | 刑部 | 代码质量、linting和合规性 |
| 工部 | 工部 | 架构、基础设施和构建系统 |

### 4. 地方官（地方官） — 项目经理
- 管理代码库的特定区域（项目/模块）
- 协调其区域内的基层官员和专家

### 5. 基层官员（基层官员） — 任务执行者
- 在区域内执行单个任务
- 向地方官报告进度

### 6. 专家 — 领域专家

| 专家 | 角色 |
|------|------|
| 架构师 | 系统设计和高层架构 |
| 实现者 | 代码编写和实现 |
| 审查员 | 代码审查和质量保证 |
| 测试员 | 测试设计和执行 |
| 研究员 | 信息收集和分析 |

## 命令参考

| 命令 | 描述 |
|------|------|
| `/gov-reign <task>` | 完整帝国工作流 — 皇帝通过层级接收并协调整个任务 |
| `/gov-decree <task>` | 发布圣旨 — 直接、不可协商的指令 |
| `/gov-report` | 查看当前政府会话的状态报告 |
| `/gov-endorse <finding>` | 批准或拒绝审查员或审计员的发现 |
| `/gov-ministry <ministry> <task>` | 直接将任务调度到特定部门（例如 `/gov-ministry engineering 实现认证`） |
| `/gov-governor <region> <task>` | 将任务调度到特定区域的地方官 |
| `/gov-official <official> <task>` | 直接将任务调度到基层官员 |
| `/gov-plan` | 调用架构师生成设计计划 |
| `/gov-implement` | 调用实现者根据计划编写代码 |
| `/gov-review` | 调用审查员审查代码或计划 |
| `/gov-test` | 调用测试员创建和运行测试 |
| `/gov-research` | 调用研究员调查问题或收集信息 |

## 架构

```
┌─────────────────────────────────────────────────┐
│                   皇帝（君主）                    │
│                 最高决策者                        │
└──────────────────────┬──────────────────────────┘
                       │ 委派
┌──────────────────────▼──────────────────────────┐
│                宰相（宰相）                       │
│                首席协调员                         │
└────┬──────┬──────┬──────┬──────┬───────┬────────┘
     │      │      │      │      │       │
┌────▼──┐┌──▼───┐┌─▼──┐┌─▼───┐┌─▼──┐┌───▼────┐
│吏部  ││户部  ││礼部││兵部││刑部││工部    │
└───┬───┘└──┬───┘└─┬──┘└─┬───┘└─┬──┘└───┬────┘
    │       │      │     │      │       │
    └───────┴──────┴──┬──┴──────┴───────┘
                      │
        ┌─────────────▼──────────────┐
        │        地方官               │
        │     （项目经理）            │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │        基层官员             │
        │      （任务执行者）         │
        └─────────────┬──────────────┘
                      │
    ┌─────────┬───────┼────────┬──────────┐
    ▼         ▼       ▼        ▼          ▼
┌────────┐┌──────┐┌───────┐┌────────┐┌──────────┐
│架构师  ││实现者││审查员 ││测试员  ││研究员    │
└────────┘└──────┘└───────┘└────────┘└──────────┘
```

### 黑板协调

代理通过**黑板**进行通信 — 这是每个会话的共享工作区。关键特性：

- **会话隔离** — 每个 `/gov-reign` 调用都会创建一个新的黑板会话。
- **TTL自动清理** — 过期的会话会自动被垃圾回收。
- **工件所有权** — 每个代理写入自己的指定工件；对其他工件只读访问。
- **可追溯性** — 完整的审计跟踪，记录哪个代理在什么时候写了什么。

### 委派模型

- 任务**自上而下**流动（皇帝 → 宰相 → 部门 → 地方官 → 基层官员 → 专家）。
- 报告**自下而上**流动（专家 → 基层官员 → 地方官 → 部门 → 宰相 → 皇帝）。
- **最大深度**可配置，以防止失控的嵌套。

## 配置

该插件从OpenCode Desktop设置中读取配置。所有选项都有合理的默认值。

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `ttlDays` | `number` | `5` | 黑板会话TTL（天） |
| `defaultAgent` | `boolean` | `true` | 皇帝是否为默认代理 |
| `maxDepth` | `number` | `10` | 最大层级嵌套深度 |
| `subagentDepth` | `number` | `9` | OpenCode子代理嵌套深度（0=禁用，1=默认，2-9=嵌套层级） |

### 子代理深度配置

该插件自动配置OpenCode的`subagent_depth`以启用层级委派：

- **`0`** — 禁用所有子代理
- **`1`** — 默认：子代理不能嵌套（仅单层）
- **`2`** — 允许2层嵌套（皇帝 → 部门 → 基层官员）
- **`3-9`** — 深度嵌套，最大化混乱和乐趣！

插件默认设置`subagent_depth: 9`以获得最大的层级混乱。你可以在`opencode.json`中覆盖此设置：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "subagent_depth": 9,
  "plugin": [
    ["@te-river/opencode-gov-mode@latest", { "subagentDepth": 9 }]
  ]
}
```

**警告：** 这仅用于娱乐目的。更高的值会导致指数级token消耗和成本增加。使用风险自负！

## 开发

```bash
# 克隆并安装
git clone https://github.com/Te-River/Opencode-GovMode.git
cd Opencode-GovMode
npm install

# 构建
npm run build

# 监视模式
npm run dev

# 运行测试
npm test
```

## 贡献

欢迎贡献！请遵循以下指南：

1. **Fork** 仓库并从 `main` 创建一个功能分支。
2. **编写代码** 遵循现有的TypeScript约定。
3. **添加测试** 为任何新功能使用现有的测试框架。
4. **在提交前运行完整的测试套件**：
   ```bash
   npm test
   ```
5. **打开一个Pull Request**，清楚地描述你改变了什么以及为什么。

### 代码风格

- TypeScript启用严格模式。
- 遵循 `src/` 下的现有文件结构。
- 优先使用命名导出而不是默认导出。
- 保持函数专注且小巧。

## 许可证

[Apache License 2.0](LICENSE)

版权所有 2026 Te-River.

根据 Apache License, Version 2.0（"许可证"）获得许可；除非符合许可证要求，否则不得使用此文件。可在以下网址获取许可证副本：

<http://www.apache.org/licenses/LICENSE-2.0>

除非适用法律要求或书面同意，否则根据许可证分发的软件按"原样"分发，不提供任何形式的保证或条件，无论是明示或暗示的。有关许可证管理权限和限制的具体语言，请参阅许可证。
