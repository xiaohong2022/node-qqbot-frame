# node-qqbot-frame

基于 QQ 官方 SDK（`@tencent-connect/qqbot-nodejs`）的 TypeScript 机器人框架，统一封装**命令、按钮、事件、插件与会话快速操作**，同时支持 C2C 私聊与 Group 群聊。

## 特性

- **命令系统**：支持多组参数模式匹配，内置 7 种参数类型（String / Int / Float / Bool / JSON / At / Option），参数不匹配时自动生成用法提示。
- **按钮系统**：提供互动按钮、跳转按钮、指令按钮，支持键盘子消息、二次确认 `modal` 与平台权限映射。
- **事件系统**：类型安全的 `EventEmitter`，提供 `message`、`c2c_message`、`group_message`、`interaction` 事件。
- **插件系统**：直接加载 `.ts` 插件（基于 jiti），提供安装/卸载生命周期，插件注册的命令、按钮与监听器会随卸载自动清理。
- **Scope 权限**：`ListScope` / `CommandScope` / `WhiteListScope` 三层作用域，支持白名单、黑名单与管理员限制。
- **会话快速操作**：`Group` / `User` / `Member` 封装消息发送、撤回、禁言、踢人与 C2C 流式消息等能力。

## 技术栈

| 项目 | 说明 |
| --- | --- |
| 语言 | TypeScript 5.9（`strict`，ESM） |
| 运行时 | Node.js >= 20（`package.json` 的 `engines`） |
| QQ SDK | `@tencent-connect/qqbot-nodejs` ^1.0.5 |
| 插件加载 | `jiti` ^2.7.0 |
| 包管理 | pnpm 11.12.0 |
| 构建 | `tsc`，输出到 `dist/` |
| 许可证 | MIT |

## 快速开始

1. 在 Node.js 项目根目录安装 npm 包：

```bash
pnpm add node-qqbot-frame @tencent-connect/qqbot-nodejs
```

2. 在项目根目录创建 `.env`：

```dotenv
QQBOT_APP_ID=你的AppID
QQBOT_APP_SECRET=你的AppSecret
```

3. 创建 `main.ts`（项目需为 ESM）：

```ts
import { QQBot } from "@tencent-connect/qqbot-nodejs";
import { App, Command } from "node-qqbot-frame";

try {
  process.loadEnvFile();
} catch {
  // 没有 .env 时使用外部注入的环境变量
}

class PingCommand extends Command {
  name = "/ping";

  handle(): string {
    return "pong";
  }
}

const bot = new QQBot({
  appId: process.env.QQBOT_APP_ID!,
  appSecret: process.env.QQBOT_APP_SECRET!,
  logger: console,
});

const app = new App(bot);
app.commands.register("ping", PingCommand);

const abort = new AbortController();
process.once("SIGINT", () => abort.abort());

await bot.start(abort.signal);
```

4. 运行：

使用 Node.js 原生 TypeScript 支持，示例按 Node 26 编写；也可先编译后执行。
```bash
node main.ts
```

5. 在 QQ 中向机器人发送 `/ping`，收到 `pong`。

> 更多完整功能示例见 [USAGE.md §12 Demo 示例](./USAGE.md#12-demo-示例)。

## 目录结构

| 路径 | 职责 |
| --- | --- |
| `src/app.ts` | `App` 应用入口：绑定 Bot 事件、分发消息与互动、汇总各管理器 |
| `src/command/` | 命令基类、管理器、分词器与参数类型 |
| `src/button/` | 按钮基类、管理器与互动/跳转/指令按钮 |
| `src/events/` | 事件基类、事件表与内置事件 |
| `src/plugin/` | 插件基类、管理器、上下文与内置插件 |
| `src/scope/` | 列表、命令、白名单作用域 |
| `src/message/` | 消息类型、发送、撤回与文本互动标记 |
| `src/models/` | `Group`、`User`、`Member` 与成员类型 |
| `src/api/` | 群管理底层 API 封装 |
| `demo/` | 覆盖全部功能点的可运行示例 |

## 文档

- [USAGE.md](./USAGE.md)：环境与安装、配置、完整用法、API 参考、FAQ 与最佳实践。

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。

## 贡献

贡献流程、代码约定与提交规范详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。