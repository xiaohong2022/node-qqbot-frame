# node-qqbot-frame 使用文档

本文档面向框架使用者和插件开发者，覆盖环境配置、命令 / 按钮 / 事件 / 插件 / 快速操作的完整用法、API 参考、示例与故障排查。

- 项目简介与快速开始见 [README.md](./README.md)。
- 本文示例默认使用 ESM + TypeScript，并从包入口 `node-qqbot-frame` 导入。

---

## 1. 环境要求

| 项目 | 要求 | 说明 |
| --- | --- | --- |
| Node.js | >= 20 | 由 `package.json` 的 `engines.node` 声明，构建产物在该版本区间运行 |
| 包管理器 | pnpm 11.12.0 | 由 `packageManager` 字段声明；仓库包含 `pnpm-lock.yaml` |
| TypeScript | 5.9.3（devDependency） | 仅构建与类型检查需要 |
| 模块体系 | ESM | `package.json` 中 `"type": "module"`，相对导入需带 `.js` 后缀 |
| QQ 机器人凭证 | `QQBOT_APP_ID`、`QQBOT_APP_SECRET` | 来自 QQ 开放平台，通过环境变量读取 |

> 说明：框架发布产物为 `dist/*.js` + `dist/*.d.ts`，可在 Node.js >= 20 运行。

---

## 2. 安装与构建

### 2.1 从 npm 安装（推荐）

| 包管理器 | 安装命令 |
| --- | --- |
| pnpm | `pnpm add node-qqbot-frame @tencent-connect/qqbot-nodejs` |
| npm | `npm install node-qqbot-frame @tencent-connect/qqbot-nodejs` |
| yarn | `yarn add node-qqbot-frame @tencent-connect/qqbot-nodejs` |

说明：

- `@tencent-connect/qqbot-nodejs` 是运行时依赖；示例中会直接 `import { QQBot }`，在 pnpm 的严格依赖布局下需要显式安装。
- 使用方项目需为 ESM（`"type": "module"` 或 `.mts` 文件），运行时要求 Node.js >= 20。
- 包仅暴露根入口，统一从 `node-qqbot-frame` 导入。

### 2.2 源码构建（仓库开发）

克隆仓库并安装依赖后构建：

```bash
pnpm install
pnpm build
```

构建配置见 `tsconfig.json`：

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| `target` | `ES2022` | 编译目标 |
| `module` / `moduleResolution` | `NodeNext` | 使用 Node.js 原生 ESM 解析 |
| `rootDir` / `outDir` | `src` / `dist` | 源码与产物目录 |
| `declaration` | `true` | 生成 `.d.ts` |
| `declarationMap` / `sourceMap` | `true` | 生成映射文件 |
| `strict` | `true` | 严格类型检查 |
| `verbatimModuleSyntax` | `true` | 要求显式 `import type` |
| `include` | `["src"]` | 仅编译 `src` |

### 2.3 npm scripts（仓库开发）

| 命令 | 作用 |
| --- | --- |
| `pnpm build` | 使用 `tsc -p tsconfig.json` 编译到 `dist/` |
| `pnpm dev` | `tsc --watch` 监听编译 |
| `pnpm typecheck` | `tsc --noEmit`，仅做类型检查 |

### 2.4 包入口

`package.json` 的 `exports` 仅暴露根入口：

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

因此：

- `import { App } from "node-qqbot-frame"` 实际读取 `dist/index.js`。
- **从 npm 安装**时，`dist/` 已包含在包内，无需执行构建。
- **仓库源码开发**时需先执行 `pnpm build`。

---

## 3. 配置说明

### 3.1 配置文件

框架本身**不读取任何配置文件**，全部配置通过构造参数与作用域对象传入；凭证通过环境变量提供。

### 3.2 环境变量

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `QQBOT_APP_ID` | `string` | 无（必填） | QQ 机器人 AppID |
| `QQBOT_APP_SECRET` | `string` | 无（必填） | QQ 机器人 AppSecret |

`.env` 示例：

```dotenv
QQBOT_APP_ID=你的AppID
QQBOT_APP_SECRET=你的AppSecret
```

> 提示：可在启动时通过 `process.loadEnvFile()` 加载 `.env`，或直接注入环境变量。

### 3.3 `App` 配置（`AppOptions`）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `logger` | `LoggerTarget` | `console` | 日志输出目标 |
| `plugins` | `PluginManagerOptions` | `{}` | 插件系统配置 |

```ts
import { resolve } from "node:path";
import { QQBot } from "@tencent-connect/qqbot-nodejs";
import { App } from "node-qqbot-frame";

const bot = new QQBot({
  appId: process.env.QQBOT_APP_ID!,
  appSecret: process.env.QQBOT_APP_SECRET!,
  logger: console,
});

const app = new App(bot, {
  logger: console,
  plugins: {
    root: resolve(import.meta.dirname, "plugins"),
    autoLoad: true,
  },
});
```

### 3.4 插件配置（`PluginManagerOptions`）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `root` | `string` | `path.resolve(process.cwd(), "plugin")` | 插件根目录，相对插件路径基于此解析 |
| `autoLoad` | `ListScopeInput` | `false` | 自动加载过滤规则，按文件名（去掉 `.ts`）匹配 |

`autoLoad` 取值：

| 取值 | 行为 |
| --- | --- |
| `false` | 不自动加载（默认） |
| `true` | 加载根目录下全部 `.ts` 插件 |
| `string[]` | 白名单，仅加载列出的文件名 |
| `{ whitelist, blacklist }` | 同时支持白名单与黑名单 |

### 3.5 作用域配置（`ListScopeInput`）

`ListScopeInput` 是命令作用域与插件自动加载共用的配置类型：

| 取值 | 说明 |
| --- | --- |
| `true` / `{}` / 不传 | 放行全部 |
| `false` | 全部拒绝 |
| `string[]` | 白名单 |
| `{ whitelist?: string[]; blacklist?: string[] }` | 白名单 + 黑名单；同时存在时先校验白名单，再校验黑名单 |

```ts
// 仅允许指定用户
scope = { c2c: ["user_openid_a", "user_openid_b"] };

// 黑白名单组合
scope = { group: { whitelist: ["group_openid_1"], blacklist: ["user_openid_x"] } };
```

---

## 4. 整体使用流程

```text
创建 QQBot
   ↓
创建 App（内部创建 commands / buttons / plugins，并绑定 bot 的 message、interaction 事件）
   ↓
注册命令 / 按钮 / 事件监听 / 插件
   ↓
bot.start(signal) 建立连接
   ↓
消息到达 → App 分发为 MessageEvent / GroupMessageEvent → 触发 message 事件
                                        ↓
                                  CommandManager 匹配并执行命令
互动到达 → App 分发为 InteractionEvent / GroupInteractionEvent → 触发 interaction 事件
                                        ↓
                                  ButtonManager 匹配并执行按钮
```

`App` 内部对每个事件分发都做了 `try/catch`，异常会通过 `logger.error("处理事件失败", error)` 记录，不会中断其他监听器。

---

## 5. 命令系统

### 5.1 定义命令

继承 `Command` 并实现 `name` 与 `handle()`，然后通过 `app.commands.register(id, Class)` 注册：

```ts
import {
  Command,
  IntParam,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
} from "node-qqbot-frame";

export class EchoCommand extends Command {
  name = "/echo";
  override description = "重复输出文本，可选重复次数";
  override params: CommandParamDefinesMatch[] = [
    [["text", StringParam]],
    [["text", StringParam], ["times", IntParam]],
  ];

  handle(params: CommandParams): string {
    const text = params.text as string;
    const times = Math.min(Math.max((params.times as number | undefined) ?? 1, 1), 5);
    return Array.from({ length: times }, () => text).join("\n");
  }
}

app.commands.register("echo", EchoCommand);
```

### 5.2 `Command` 字段

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 无（抽象） | 命令名，需与消息首个 token 完全一致（通常包含 `/`） |
| `params` | `CommandParamDefinesMatch[]` | `[]` | 参数模式列表，每个模式是 `[参数 id, 参数实例][]` |
| `description` | `string \| undefined` | `undefined` | 命令描述，用于用法提示与 `/commands` |
| `scope` | `CommandScope \| CommandScopeInput` | `{}` | 命令作用域 |
| `only_at` | `boolean` | `false` | 群聊中是否仅允许 @机器人 的消息触发 |
| `handle(params, event)` | 方法 | — | 处理命令，返回 `void \| string \| Message` 或对应 Promise |

### 5.3 匹配与执行流程

1. 从消息 `mentions[0]` 判断是否 @机器人（`is_you === true`），并移除内容中的 `<@openid>` 标记。
2. 取内容中第一个空白前的部分作为命令名，与已注册命令的 `name` 做**全等匹配**。
3. 群聊中若命令声明 `only_at = true` 但未 @机器人，则跳过。
4. 校验 `scope`（会话类型、openid 列表、`only_admin`）。
5. 使用分词器切分参数，按参数个数筛选 `params` 中的候选模式。
6. 按声明顺序逐个尝试解析；第一个解析成功的模式执行 `handle()`。
7. `handle()` 返回 `string` 或消息对象时自动回复；返回 `void` 则不回复。
8. 所有候选都解析失败时输出首个参数错误；`handle()` 抛出异常时输出 `TraceId`。

> 命令名匹配区分大小写与斜杠；注册为 `ping` 时不会匹配 `/ping`，注册为 `/ping` 时不会匹配 `ping`。

### 5.4 参数模式

`params` 的每个元素是一组参数定义，参数个数必须与输入 token 数一致才会成为候选：

```ts
override params: CommandParamDefinesMatch[] = [
  [["text", StringParam]],                                  // /echo <text>
  [["text", StringParam], ["times", IntParam]],             // /echo <text> <times>
];
```

不声明 `params` 时，只接受零参数调用。

### 5.5 分词规则

`tokenizeCommand()` 的规则：

- 以空白字符分隔参数；
- 使用 `"` 或 `'` 包裹含空格的参数（引号本身不进入参数值）；
- 以 `{` 或 `[` 开头的参数按 JSON 处理，保留内部双引号与空白，直到最外层括号闭合；
- 未闭合的引号或 JSON 会抛错，命令流程输出 `TraceId`。

```text
/echo "hello world"        → ["/echo", "hello world"]
/config true {"a": 1}      → ["/config", "true", "{\"a\": 1}"]
```

### 5.6 参数类型

| 名称 | 输出类型 | 输入要求 | 说明 |
| --- | --- | --- | --- |
| `StringParam` | `string` | 任意 token | 原样返回 |
| `IntParam` | `number` | `/^[+-]?\d+$/` | 十进制整数 |
| `FloatParam` | `number` | 十进制数字，可带指数 | 且必须为有限数 |
| `BoolParam` | `boolean` | `1/true/on/yes/y` 或 `0/false/off/no/n`（忽略大小写） | 布尔值 |
| `JsonParam` | `unknown` | `JSON.parse` 成功且结果为数组或对象 | 不接受 `null` 与基本类型 |
| `AtParam` | `string` | `<@openid>` | 返回其中的 openid |
| `OptionParam(options)` | `string` | `options` 中的某个 label | 返回对应 key |

`OptionParam` 示例：

```ts
OptionParam({ add: "+", sub: "-", mul: "*", div: "/" });
// 输入 "+" → "add"；用法提示为 (+|-|*|/)
```

参数解析失败会抛出 `CommandParamError`，其 `message` 会直接回复给用户，例如：

```text
参数 "abc" 不是合法的整数
参数 "maybe" 不是合法的布尔值（可用：1/0、true/false、on/off）
参数 "%" 不在可选项中（可选：+、-、*、/）
```

### 5.7 自定义参数

```ts
import { CommandParam, CommandParamError } from "node-qqbot-frame";

class HexParam extends CommandParam<number> {
  parse(value: string): number {
    if (!/^0x[0-9a-f]+$/i.test(value)) {
      throw new CommandParamError(`参数 "${value}" 不是合法的十六进制数`);
    }
    return Number.parseInt(value.slice(2), 16);
  }

  override usage(id: string): string {
    return `0x<${id}>`;
  }
}
```

### 5.8 命令作用域（`CommandScope`）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `c2c` | `ListScope \| ListScopeInput` | `{}`（全部放行） | 私聊消息的 openid 作用域 |
| `group` | `ListScope \| ListScopeInput` | `{}`（全部放行） | 群消息的 openid 作用域 |
| `only_admin` | `boolean` | `false` | 仅管理员，且仅在群聊生效 |

```ts
// 仅群管理员、必须 @机器人、且仅群聊可用
override only_at = true;
override scope = { only_admin: true, group: true, c2c: false };
```

成员是否为管理员由 `MemberType` 判断：`ADMIN` 与 `OWNER` 均视为管理员（`isMemberAdmin`）。

### 5.9 命令管理器 API

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `register` | `(id: string, ctor: Constructor<Command>) => Command` | 注册并实例化命令；ID 重复会抛错 |
| `unregister` | `(id: string) => boolean` | 注销命令，成功返回 `true` |
| `listAvailable` | `(event, with_only_at = false) => Command[]` | 列出当前环境下可用命令；`with_only_at` 为 `true` 时不过滤 `only_at` 命令 |

### 5.10 错误处理

| 场景 | 表现 |
| --- | --- |
| 没有参数个数匹配的模式 | 回复 `参数不匹配，用法：` + 自动生成的用法 |
| 参数解析抛出 `CommandParamError` | 回复错误 `message` |
| `handle()` 抛出其他异常 | 记录错误日志，回复 `啊哈？貌似出了点意外...\nTraceId: <id>` |
| `handle()` 返回 `string` / 消息对象 | 通过 `event.echo()` 发送 |
| 回复发送失败 | 静默忽略，不影响命令流程 |

自动生成的用法示例（`/echo`）：

```text
参数不匹配，用法：
/echo <text>
/echo <text> <times>
重复输出文本，可选重复次数
```

---

## 6. 按钮系统

### 6.1 三类按钮

| 基类 | `action.type` | 点击行为 |
| --- | --- | --- |
| `InteractButton` | `1` | 触发 `interaction` 事件，由框架调用 `handle()` 并回传 `InteractionStatus` |
| `LinkButton` | `0` | 跳转链接或小程序，不触发 `interaction` |
| `CommandButton` | `2` | 在输入框写入指令；`enter = true` 时直接发送（仅单聊） |

### 6.2 `Button` 公共字段

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 无（抽象） | 按钮唯一 ID；注册 ID 必须与实例 `id` 一致 |
| `scope` | `WhiteListScope \| WhiteListScopeInput` | `{ ids: true }` | 按钮作用域 |
| `label` | `string` | 无（抽象） | 按钮文字 |
| `visited_label` | `string \| undefined` | 与 `label` 相同 | 点击后文字 |
| `style` | `ButtonStyle \| number` | 无（抽象） | 按钮风格 |
| `modal` | `IButtonModal \| undefined` | `undefined` | 点击二次确认弹窗 |
| `build(custom?)` | 方法 | — | 构建平台 `IButton`；传入对象时直接深拷贝 |

`ButtonStyle`：

| 名称 | 值 |
| --- | --- |
| `NORMAL` | `0` |
| `HIGHLIGHT` | `1` |
| `DANGER` | `3` |
| `PRIMARY` | `4` |

### 6.3 互动按钮

```ts
import {
  ButtonStyle,
  InteractionStatus,
  InteractButton,
  type GroupInteractionEvent,
  type InteractionEvent,
} from "node-qqbot-frame";

export class HelpButton extends InteractButton {
  id = "help";
  label = "查看帮助";
  override visited_label = "已查看帮助";
  style = ButtonStyle.PRIMARY;
  override scope = { ids: true };
  override modal = {
    content: "要查看帮助吗？",
    confirm_text: "查看",
    cancel_text: "取消",
  };

  async handle(
    _data: string,
    event: InteractionEvent | GroupInteractionEvent,
  ): Promise<InteractionStatus> {
    await event.echo("帮助内容……");
    return InteractionStatus.SUCCESS;
  }
}

app.buttons.register("help", HelpButton);
```

`handle(data, event)` 的 `data` 来自按钮的 `action.data`；返回值缺省时按 `InteractionStatus.SUCCESS` 处理。

### 6.4 跳转按钮与指令按钮

```ts
import { ButtonStyle, CommandButton, LinkButton } from "node-qqbot-frame";

export class WikiButton extends LinkButton {
  id = "wiki";
  label = "官方文档";
  style = ButtonStyle.NORMAL;
  link = "https://bot.q.qq.com/wiki/";
  override unsupport_tips = "当前版本不支持跳转，请升级 QQ";
}

export class RollButton extends CommandButton {
  id = "roll";
  label = "掷骰子";
  style = ButtonStyle.HIGHLIGHT;
  command = "/roll";
  override enter = true;
}
```

| 类 | 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `LinkButton` | `link` | `string` | 无（抽象） | 跳转地址 |
| `LinkButton` | `unsupport_tips` | `string \| undefined` | `undefined` | 版本过低提示 |
| `CommandButton` | `command` | `string` | 无（抽象） | 指令内容 |
| `CommandButton` | `enter` | `boolean` | `false` | 点击后直接发送指令，仅单聊可用 |
| `CommandButton` | `reply` | `boolean` | `false` | 指令是否带引用回复 |
| `CommandButton` | `anchor` | `number \| undefined` | `undefined` | 设置后忽略 `enter`；`1` 表示唤起选图器（仅手机端单聊） |
| `CommandButton` | `unsupport_tips` | `string \| undefined` | `undefined` | 版本过低提示 |

> 跳转按钮与指令按钮不需要调用 `app.buttons.register()`；只有互动按钮需要注册，因为只有它会被回调分发。

### 6.5 按钮权限映射

`scope` 会被映射为平台 `action.permission`：

| `WhiteListScope` | 平台权限 |
| --- | --- |
| `only_admin: true` | `{ type: 1 }`（管理员） |
| `ids: true` | `{ type: 2 }`（所有人） |
| `ids: false` | `{ type: 0, specify_user_ids: [] }` |
| `ids: string[]` | `{ type: 0, specify_user_ids: [...] }` |

> 点击时框架只校验 `ids`；`only_admin` 通过平台权限限制，不在框架侧二次校验。

### 6.6 按钮处理流程

1. 收到 `interaction` 事件，仅处理 `interaction.type === 11`（按钮回调）。
2. 读取 `interaction.data.resolved.button_id`，在按钮注册表中查找。
3. 未找到按钮或缺少 `button_id` 时回传 `InteractionStatus.FAILED`。
4. 使用 `scope.ids` 校验点击者 openid，不通过时回传 `NO_PERMISSION`。
5. 调用 `button.handle(resolved.button_data ?? "", event)`，异常时回传 `FAILED`。
6. 通过 `bot.acknowledgeInteraction(id, status)` 回传结果。

`InteractionStatus`：

| 名称 | 值 | 说明 |
| --- | --- | --- |
| `SUCCESS` | `0` | 成功 |
| `FAILED` | `1` | 失败 |
| `FREQUENT` | `2` | 操作频繁 |
| `DUPLICATE` | `3` | 重复操作 |
| `NO_PERMISSION` | `4` | 无权限 |
| `NOT_ADMIN` | `5` | 非管理员 |

### 6.7 组装键盘

Markdown 消息支持 `keyboard: IButton[][]`，每个子数组是一行：

```ts
handle() {
  return {
    type: "markdown",
    markdown: "### 按钮演示",
    keyboard: [
      [helpButton.build("help"), wikiButton.build(), rollButton.build()],
      [adminNoteButton.build()],
    ],
  };
}
```

`build()` 传入自定义 `IButton` 对象时会直接 `structuredClone`，忽略按钮类自身的其他字段。

---

## 7. 事件系统

### 7.1 事件表（`AppEventMap`）

| 事件名 | 负载类型 | 触发时机 |
| --- | --- | --- |
| `message` | `MessageEvent \| GroupMessageEvent` | 任意消息（C2C 与群聊） |
| `c2c_message` | `MessageEvent` | C2C 私聊消息 |
| `group_message` | `GroupMessageEvent` | 群聊消息 |
| `interaction` | `InteractionEvent \| GroupInteractionEvent` | 任意互动事件（如按钮回调） |

```ts
app.events.on("message", (event) => {
  app.logger.info(`[${event.kind}] ${event.sender.openid}: ${event.content}`);
});

app.events.on("group_message", (event) => {
  app.logger.debug(`群 ${event.group.openid} 成员 ${event.sender.openid}`);
});

app.events.on("interaction", (event) => {
  app.logger.info(`互动场景=${event.kind} 类型=${event.type}`);
});
```

### 7.2 `EventEmitter` API

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `on` | `(event, listener) => this` | 注册监听 |
| `once` | `(event, listener) => this` | 仅触发一次 |
| `off` | `(event, listener) => this` | 移除监听 |
| `emit` | `(event, payload) => void` | 触发事件（内部使用） |
| `removeAllListeners` | `(event?) => this` | 移除全部或指定事件的监听 |
| `listenerCount` | `(event) => number` | 当前监听器数量 |

`EventEmitter` 不依赖 Node.js 内置 `EventEmitter`，触发时会复制监听器集合，允许在回调中增删监听。

### 7.3 `MessageEvent`

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `app` | `App` | 框架应用实例 |
| `ctx` | `MiddlewareContext` | 底层 SDK context |
| `msg` | `QQBotInboundMessage` | 底层入站消息 |
| `sender` | `User`（群聊为 `Member`） | 发送者 |
| `kind` | `"c2c" \| "group"` | 会话类型 |
| `content` | `string` | 消息内容 |
| `msgId` | `string` | 消息 ID |
| `timestamp` | `string` | 发送时间 |
| `refMsgIdx` | `string \| undefined` | 被引用消息的引用索引 |
| `msgIdx` | `string \| undefined` | 本条消息的引用索引 |
| `echo(content)` | `Promise<MessageSendingResult>` | 被动回复当前会话（带 `msg_id`） |
| `reply(content)` | `Promise<MessageSendingResult>` | 带引用的被动回复 |
| `delete()` | `Promise<boolean>` | 撤回当前消息 |

`GroupMessageEvent` 额外提供：

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `sender` | `Member` | 群成员 |
| `group` | `Group` | 所属群 |

### 7.4 `InteractionEvent`

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `app` | `App` | 框架应用实例 |
| `ctx` | `InteractionContext` | 底层 SDK context |
| `interaction` | `QQBotInteractionEvent` | 底层互动数据 |
| `sender` | `User`（群聊为 `Member`） | 触发者 |
| `kind` | `"c2c" \| "group"` | 场景 |
| `type` | `number` | 互动类型 |
| `timestamp` | `string \| undefined` | 触发时间 |
| `data` | `QQBotInteractionEvent["data"]` | 互动数据 |
| `echo(content)` | `Promise<MessageSendingResult>` | 通过 `event_id` 回复互动 |

`GroupInteractionEvent` 额外提供 `sender: Member` 与 `group: Group`。

> 分发规则：群聊消息同时触发 `message` 与 `group_message`；私聊消息同时触发 `message` 与 `c2c_message`；互动只触发 `interaction`。

---

## 8. 插件系统

### 8.1 编写插件

插件文件必须导出一个继承 `BasePlugin` 的类：

```ts
import {
  BasePlugin,
  Command,
  type PluginContext,
} from "node-qqbot-frame";

class HelloCommand extends Command {
  name = "/hello";

  handle(): string {
    return "hello";
  }
}

export default class HelloPlugin extends BasePlugin {
  override id = "hello";

  override onInstall(ctx: PluginContext): void {
    ctx.logger.info("hello 插件已安装");
    ctx.commands.register("hello_command", HelloCommand);

    ctx.events.on("message", (event) => {
      ctx.logger.debug(`收到消息：${event.content}`);
    });
  }

  override onUninstall(ctx: PluginContext): void {
    ctx.logger.info("hello 插件已卸载");
  }
}
```

### 8.2 插件类字段

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | `string \| undefined` | 文件名（去掉 `.ts`） | 插件唯一 ID |
| `onInstall` | `(ctx) => void \| Promise<void>` | 可选 | 安装（加载）时调用 |
| `onUninstall` | `(ctx) => void \| Promise<void>` | 可选 | 卸载时调用，返回后框架自动清理注册与监听 |

### 8.3 插件文件解析规则

- 必须是 `.ts` 文件，且不能是 `.d.ts`；
- 必须真实存在且为文件；
- 优先使用 `default` 导出；若 `default` 不是 `BasePlugin` 子类，则要求模块中**恰好一个** `BasePlugin` 子类；
- 导出多个 `BasePlugin` 子类且无 `default` 时会报错；
- 同一文件不能重复安装；
- 插件 ID 冲突会报错。

### 8.4 加载方式

| 方式 | 说明 |
| --- | --- |
| 自动加载 | 扫描 `root` 目录（不递归）下的 `.ts` 文件，按 `autoLoad` 规则过滤后安装 |
| 显式安装文件 | `app.plugins.install("hello.ts")`，相对路径基于 `root` |
| 安装内置插件 | `app.plugins.install("builtin:ping")`、`app.plugins.install("builtin:commands")` |

`autoLoad` 默认是 `false`，即默认不自动加载；例如 `autoLoad: ["hello"]` 表示仅自动加载 `hello.ts`。

插件模块通过 jiti 加载，并设置 `moduleCache: false`，卸载后重新安装可读取最新代码。

### 8.5 `PluginManager` API

| 方法 / 属性 | 签名 | 说明 |
| --- | --- | --- |
| `root` | `string` | 插件根目录绝对路径 |
| `ready` | `Promise<void>` | 自动加载完成的 Promise；`autoLoad: false` 时立即完成 |
| `install` | `(file: string) => Promise<PluginInfo>` | 安装插件文件或内置插件 |
| `uninstall` | `(idOrFile: string) => Promise<boolean>` | 按 ID 或文件路径卸载 |
| `loadAll` | `(filter?: ListScopeInput) => Promise<PluginInfo[]>` | 扫描并安装；不传参时使用内部过滤规则（`autoLoad: false` 时该规则为 `true`，即显式调用会加载全部） |
| `uninstallAll` | `() => Promise<void>` | 卸载全部已安装插件 |
| `list` | `() => PluginInfo[]` | 当前已安装插件列表 |
| `has` | `(id: string) => boolean` | 是否已安装 |
| `get` | `(id: string) => PluginInfo \| undefined` | 获取插件信息 |

`PluginInfo`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 插件 ID |
| `file` | `string` | 文件绝对路径或内置插件 ID |
| `instance` | `BasePlugin` | 插件实例 |
| `installedAt` | `number` | 安装时间（Unix 毫秒） |

### 8.6 `PluginContext`

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 当前插件 ID |
| `file` | `string \| undefined` | 插件文件路径；内置插件为 `undefined` |
| `dir` | `string \| undefined` | 插件文件所在目录；内置插件为 `undefined` |
| `logger` | `Logger` | 名称带 `plugin:<id>` 前缀的日志器 |
| `commands` | `PluginCommandRegistry` | 插件命令注册入口，自动追踪 ID |
| `buttons` | `PluginButtonRegistry` | 插件按钮注册入口，自动追踪 ID |
| `events` | `PluginEventRegistry` | 插件事件监听入口，卸载时统一移除 |
| `group(openid)` | `Group` | 构建群快速操作对象 |
| `user(openid)` | `User` | 构建用户快速操作对象 |

各注册入口常用方法：

| 类 | 方法 | 说明 |
| --- | --- | --- |
| `PluginCommandRegistry` | `register(id, ctor)` / `unregister(id)` | 注册 / 注销命令 |
| `PluginButtonRegistry` | `register(id, ctor)` / `unregister(id)` | 注册 / 注销互动按钮 |
| `PluginEventRegistry` | `on` / `once` / `off` / `removeAllListeners` | 监听事件 |

### 8.7 生命周期与资源清理

- `onInstall` 抛错时，会先 `ctx.dispose()` 再抛出异常，插件不会进入已安装列表。
- `uninstall()` 先调用 `onUninstall`（即使抛错也继续），随后 `ctx.dispose()` 清理命令、按钮、事件监听，再删除插件记录；若 `onUninstall` 抛错，清理完成后仍会抛出该错误。
- 内置插件默认**不加载**，必须在自动加载完成后显式 `install()`。

### 8.8 内置插件

| 内置 ID | 类 | 行为 |
| --- | --- | --- |
| `builtin:ping` | `BulitinPingPongPlugin` | 命令 `/ping` 返回 `pong`；消息内容为 `ping`（忽略大小写、去除首尾空白）时回复 `pong` |
| `builtin:commands` | `BulitinCommandsPlugin` | 命令 `/commands` 列出当前环境下可用的命令与用法 |

```ts
await app.plugins.ready;
await app.plugins.install("builtin:ping");
await app.plugins.install("builtin:commands");
```

---

## 9. 快速操作与会话模型

### 9.1 `Group`

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `directMsg` | `(content: MessageContent) => Promise<MessageSendingResult>` | 主动发送群消息（不关联入站消息） |
| `deleteGroupMsg` | `(msgid: string) => Promise<boolean>` | 撤回群消息，成功返回 `true` |
| `member` | `(openid: string) => Member` | 构建群成员对象 |

### 9.2 `User`

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `c2cMsg` | `(content: MessageContent) => Promise<MessageSendingResult>` | 主动发送 C2C 消息 |
| `openC2CStream` | `(msgid: string) => StreamSession` | 打开 C2C 流式消息会话 |
| `deleteC2CMsg` | `(msgid: string) => Promise<boolean>` | 撤回 C2C 消息 |
| `toMember` | `(group_openid: string) => Member` | 将用户转换为指定群的成员对象 |

### 9.3 `Member extends User`

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `ban` | `(second: number) => Promise<boolean>` | 禁言指定秒数 |
| `banTo` | `(timestamp: number) => Promise<boolean>` | 禁言到指定 Unix 毫秒时间戳 |
| `unban` | `() => Promise<boolean>` | 解除禁言 |
| `remove` | `(add_to_member_blacklist = false) => Promise<boolean>` | 移除成员，可选加入群黑名单 |

群管理方法均以 `boolean` 返回结果，内部捕获异常；`remove()` 仅在接口返回 `remove_members_result === "success"` 时为 `true`。

### 9.4 成员类型

```ts
enum MemberType {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner",
}
```

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `parseMemberType` | `(role: unknown) => MemberType` | 将平台 `member_role` 转为枚举，未知值视为 `MEMBER` |
| `isMemberAdmin` | `(type: MemberType) => boolean` | `ADMIN` 或 `OWNER` 返回 `true` |

### 9.5 示例：禁言与踢人

```ts
const ok = await event.group.member(openid).ban(60);        // 禁言 60 秒
const unbanned = await event.group.member(openid).unban();
const removed = await event.group.member(openid).remove(false);
```

---

## 10. 消息与发送

### 10.1 消息类型

`MessageContent = string | Message`，字符串会转换为纯文本消息。

| 类型 | 字段 | 平台 `msg_type` |
| --- | --- | --- |
| `TextMessage` | `type: "text"`、`text: string` | `0` |
| `MarkdownMessage` | `type: "markdown"`、`markdown: string \| string[]`、`keyboard?: IButton[][]` | `2` |
| `MediaMessage` | `type: "media"`、`file_info: string` | `7` |
| `CardMessage` | `type: "card"`、`card: IMessageCard` | `8` |

```ts
await event.echo("纯文本");

await event.echo({
  type: "markdown",
  markdown: ["### 标题", "正文"],
  keyboard: [[button.build("data")]],
});

await event.echo({ type: "media", file_info: "上传接口返回的 file_info" });
await event.echo({ type: "card", card: { type: "template", content: {} } });
```

`markdown` 为数组时会以换行拼接；`keyboard` 会转换为平台的 `keyboard.content.rows`。

### 10.2 发送与撤回

| API | 说明 |
| --- | --- |
| `event.echo(content)` | 被动回复，自动携带当前消息 `msg_id` |
| `event.reply(content)` | 被动回复并携带 `message_reference`（引用索引 `refMsgIdx`） |
| `event.delete()` | 撤回触发消息 |
| `event.group.directMsg(content)` | 群主动消息 |
| `event.sender.c2cMsg(content)` | C2C 主动消息 |
| `result.delete()` | 撤回刚发送的消息 |

`MessageSendingResult`：

| 字段 / 方法 | 类型 | 说明 |
| --- | --- | --- |
| `msgId` | `string` | 消息 ID |
| `timestamp` | `number \| string` | 发送时间戳 |
| `msgIdx` | `string \| undefined` | 消息引用索引 |
| `delete()` | `Promise<boolean>` | 撤回本条消息 |

### 10.3 文本互动标记

| 函数 | 签名 | 输出 |
| --- | --- | --- |
| `at` | `(openid: string) => string` | `<qqbot-at-user id="openid" />` |
| `at_all` | `() => string` | `<qqbot-at-everyone />` |
| `cmd_enter` | `(text: string) => string` | `<qqbot-cmd-enter text="text" />` |
| `cmd_input` | `(text: string, show: string, ref = false) => string` | `<qqbot-cmd-input text="text" show="show" reference="false" />` |

传入内容会进行属性转义（`&`、`"`、`<`、`>`）。

### 10.4 流式消息

`User.openC2CStream(msgid)` 返回底层 SDK 的 `StreamSession`，仅 C2C 可用：

```ts
override scope = { c2c: true, group: false };

async handle(params: CommandParams, event: MessageEvent): Promise<string> {
  const stream = event.sender.openC2CStream(event.msgId);
  await stream.update("第 1 帧");
  await stream.update("第 2 帧");
  await stream.complete();
  return "流式消息已推送完成";
}
```

---

## 11. 日志

`LoggerTarget` 约定：

| 方法 | 是否必需 | 说明 |
| --- | --- | --- |
| `info` | 是 | 信息 |
| `error` | 是 | 错误 |
| `warn` | 否 | 未提供时静默忽略 |
| `debug` | 否 | 未提供时静默忽略 |

`Logger`：

| 成员 | 说明 |
| --- | --- |
| `info/debug/warn/error(message, ...args)` | 以 `[<name>]` 为前缀输出到对应目标方法 |
| `child(name)` | 使用同一目标创建新的子日志器 |

框架内部日志器名称：`app`、`command`、`button`、`plugin`、`plugin:<id>`。

> 命令匹配、参数解析、按钮匹配等细节使用 `debug` 级别；使用 `console` 作为目标时可通过 `logger.debug` 查看。

---

## 12. Demo 示例

### 运行 Demo

```bash
node demo/main.ts
```

运行前需在 `demo/.env` 中配置 `QQBOT_APP_ID` / `QQBOT_APP_SECRET`。该流程仅用于仓库内体验；

demo 的启动流程：

1. 通过 `process.loadEnvFile(resolve(import.meta.dirname, "./.env"))` 加载 `demo/.env`（文件不存在时忽略，继续使用外部注入的环境变量）。
2. 校验 `QQBOT_APP_ID` / `QQBOT_APP_SECRET`，缺失时打印提示并以退出码 `1` 结束。
3. 创建 `QQBot` 与 `App`，配置插件根目录 `demo/plugins`、自动加载 `["welcome", "admin-tools"]`。
4. 注册 demo 按钮与命令，注册事件监听。
5. 等待 `app.plugins.ready`，再显式安装内置插件 `builtin:ping`、`builtin:commands`。
6. 监听 `SIGINT` / `SIGTERM`，通过 `AbortController` 触发 `bot.start()` 退出。
7. `finally` 中执行 `app.plugins.uninstallAll()` 清理插件。

### 示例命令

以下命令由 `demo/main.ts` 注册（`/ping`、`/commands` 由内置插件提供）：

| 命令 | 参数 | 说明 | 演示点 |
| --- | --- | --- | --- |
| `/echo` | `<text> [times]` | 重复输出文本 | 多组参数模式、`StringParam`、`IntParam` |
| `/calc` | `<a> <op> <b>` | 四则运算 | `FloatParam`、`OptionParam` |
| `/config` | `<enable> [json]` | 布尔开关 + 可选 JSON | `BoolParam`、`JsonParam` |
| `/at` | `<@user>` | 解析 @ 用户 | `AtParam`、`at()` |
| `/admin` | — | 群管理员命令 | `only_admin`、`only_at` |
| `/c2c` | — | 仅私聊可用 | `scope.group = false` |
| `/roll` | — | 掷骰子 | 无参数命令 |
| `/plugin` | `list` / `install <target>` / `uninstall <target>` | 插件管理 | `PluginManager` |
| `/panel` | — | 发送带键盘的 Markdown | 三类按钮组装 |
| `/push` | `<text>` | 主动消息 | `Group.directMsg` / `User.c2cMsg` |
| `/quote` | `<text>` | 引用回复 | `MessageEvent.reply` |
| `/recall` | — | 撤回触发消息 | `MessageEvent.delete` |
| `/temp` | `<text>` | 发送后 3 秒撤回 | `MessageSendingResult.delete` |
| `/delete` | `<msgid>` | 按消息 ID 撤回 | `deleteGroupMsg` / `deleteC2CMsg` |
| `/stream` | `<text>` | C2C 流式消息 | `openC2CStream` |
| `/member` | `<@user>` | 展示成员对象 | `Group.member` / `User.toMember` |
| `/mute` | `<@user> <seconds>` | 禁言 | `Member.ban` |
| `/unmute` | `<@user>` | 解除禁言 | `Member.unban` |
| `/ban-to` | `<@user> <timestamp>` | 禁言到指定时间 | `Member.banTo` |
| `/welcome` | — | 欢迎语（插件） | 插件命令、`GroupMessageEvent` |
| `/kick` | `<@user>` | 移除成员（插件） | 插件命令、`AtParam` |
| `/mod-panel` | `<@user>` | 管理卡片（插件） | 插件按钮、`keyboard` |
| `/ping` | — | 返回 `pong` | 内置插件 `builtin:ping` |
| `/commands` | — | 列出可用命令 | 内置插件 `builtin:commands` |

---

### 示例合集（输入 → 输出）

> 以下结果假设对应命令已注册、权限满足。

| 输入 | 输出 |
| --- | --- |
| `/echo 你好` | `你好` |
| `/echo 你好 2` | `你好` 换行 `你好` |
| `/echo` | `参数不匹配，用法：` 后跟 `/echo <text>`、`/echo <text> <times>` 与描述 |
| `/echo hi abc` | `参数 "abc" 不是合法的整数` |
| `/calc 3 + 4` | `3 + 4 = 7` |
| `/calc 1 / 0` | `除数不能为 0` |
| `/calc 1 % 2` | `参数 "%" 不在可选项中（可选：+、-、*、/）` |
| `/config on` | `开关：开启` |
| `/config true {"a":1}` | `开关：开启` 换行 `配置：{"a":1}` |
| `/config maybe` | `参数 "maybe" 不是合法的布尔值（可用：1/0、true/false、on/off）` |
| `/at <@ABC>` | `<qqbot-at-user id="ABC" /> 已解析 openid：ABC` |
| `/roll` | `掷骰结果：<1~6>` |
| 文本消息 `ping` | `pong`（需已安装 `builtin:ping`） |
| `/admin`（群聊，未 @机器人） | 无响应 |
| `/admin`（群聊，管理员 @机器人） | `管理员命令执行成功（scope.only_admin + only_at）` |
| `/c2c`（群聊） | 无响应 |
| `/commands` | 当前环境下各命令的用法列表 |
| `/kick <@成员>`（非管理员） | 无响应（scope 拦截） |
| `/kick <@成员>`（管理员，未 @机器人） | 无响应（`only_at` 拦截） |

---

## 13. FAQ 与故障排查

### Q1. 插件没有被加载

- `autoLoad` 默认是 `false`，需要显式配置或调用 `app.plugins.install()`；
- 检查 `root` 是否指向正确目录（默认 `process.cwd()/plugin`）；
- 自动加载只扫描根目录下的 `.ts` 文件，不递归子目录；
- 过滤依据是**文件名**（去掉 `.ts`），不是插件自定义 `id`。

### Q2. 日志出现 `插件目录不存在：...`

`loadAll` 在目录不存在时（`ENOENT`）返回空数组并记录警告，不影响启动。创建目录或修正 `root` 即可。

### Q3. 命令发送后没有反应

依次检查：

1. 命令名是否完全一致（包括 `/` 与大小写）；
2. 群聊中是否声明了 `only_at` 但未 @机器人；
3. `scope` 是否拦截了当前会话或 openid；
4. 参数个数是否与某个 `params` 模式一致；
5. 是否因参数解析错误触发了错误回复；
6. 将日志级别切到 `debug` 查看匹配过程。

### Q4. 按钮点击没有反应

- 框架只处理 `interaction.type === 11`；
- 互动按钮必须通过 `app.buttons.register(id, Class)` 注册，且注册 ID 必须等于实例 `id`；
- 检查 `scope.ids` 是否包含点击者 openid；
- `only_admin` 依赖平台权限，框架点击时不再校验；
- 若 `handle()` 抛错，会回传 `FAILED`，可查看日志。

### Q5. 插件报“必须导出一个继承 BasePlugin 的类”或“导出了多个”

请使用 `export default class XxxPlugin extends BasePlugin {}` 明确指定插件类。

### Q6. 撤回 / 禁言 / 踢人返回 `false`

这些方法内部捕获异常并返回 `false`，常见原因：

- 机器人缺少相应群管理权限；
- 消息超过可撤回时限；
- openid 或消息 ID 不正确。

请结合平台接口返回与机器人权限排查。

### Q7. `/stream` 在群聊无效

流式消息仅支持 C2C，需将命令的 `scope` 限制为 `{ c2c: true, group: false }`，群聊会被拦截。

### Q8. 注册时报“已注册”或“ID 不一致”

- 命令、按钮 ID 在各自注册表中必须唯一；
- 按钮注册 ID 与实例 `id` 必须一致；
- 插件 ID 冲突时也会报错，可先 `uninstall` 或更换 ID。

### Q9. 插件修改后重新安装仍是旧代码

正常情况下 jiti 已禁用模块缓存，重新安装会读取最新代码。若仍异常，确认安装的是同一路径且旧实例已卸载。

---

## 14. 进阶用法与最佳实践

### 14.1 使用多组参数模式表达可选参数

将不同参数个数分别声明为独立模式，避免在 `handle()` 中手工拆分字符串：

```ts
override params: CommandParamDefinesMatch[] = [
  [["enable", BoolParam]],
  [["enable", BoolParam], ["value", JsonParam]],
];
```

### 14.2 用 Scope 收敛命令暴露面

- 管理类命令使用 `{ only_admin: true, group: true, c2c: false }`；
- 需要 @机器人 才响应时同时设置 `only_at = true`；
- 私聊专用命令使用 `{ c2c: true, group: false }`；
- 黑白名单组合适合灰度或屏蔽个别用户。

### 14.3 插件内注册、插件内清理

优先使用 `ctx.commands` / `ctx.buttons` / `ctx.events`，而不是 `app.commands` 等全局入口。这样卸载插件时资源会被统一回收，避免残留监听或命令。

### 14.4 错误处理与 TraceId

命令内部尽量让可预期的参数错误以 `CommandParamError` 抛出，框架会把错误信息直接反馈给用户；其他异常会生成 `TraceId` 并记录完整错误日志，便于用户反馈与定位。

### 14.5 优雅退出

使用 `AbortController` 响应 `SIGINT` / `SIGTERM`，并在 `finally` 中卸载全部插件：

```ts
const abort = new AbortController();
process.once("SIGINT", () => abort.abort());
process.once("SIGTERM", () => abort.abort());

try {
  await bot.start(abort.signal);
} finally {
  await app.plugins.uninstallAll();
}
```

### 14.6 消息内容构建

- 普通文本直接用字符串；
- 需要按钮时使用 `markdown` + `keyboard`；
- 富媒体先通过平台上传接口获取 `file_info`，再发送 `media`；
- 需要 @ 用户或指令提示时，使用 `at()`、`at_all()`、`cmd_enter()`、`cmd_input()` 生成标记。

---

## 15. 许可证与贡献

- 许可证：MIT，详见 [LICENSE](./LICENSE)。
- 贡献说明：[CONTRIBUTING.md](./CONTRIBUTING.md)。
- 返回项目简介：[README.md](./README.md)。
