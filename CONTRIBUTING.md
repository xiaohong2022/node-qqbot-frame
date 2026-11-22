# 贡献指南

感谢你关注并参与 `node-qqbot-frame`。本文说明开发环境、代码约定、提交规范与 PR 流程，帮助改动顺利合入。

## 1. 行为准则

- 保持尊重，围绕技术问题讨论，提供可执行的反馈。
- 不接受人身攻击、歧视、骚扰或泄露他人隐私的内容。
- 提交内容需遵守项目使用的 [MIT License](./LICENSE)。

## 2. 环境准备

| 项目 | 要求 |
| --- | --- |
| Node.js | >= 20 |
| pnpm | 11.12.0（见 `packageManager`） |
| TypeScript | 5.9.3（devDependency） |
| 模块体系 | ESM（`"type": "module"`） |

获取代码并安装依赖：

```bash
pnpm install
```

提交前至少完成类型检查与构建：

```bash
pnpm typecheck
pnpm build
```

## 3. 目录职责

| 路径 | 职责 |
| --- | --- |
| `src/app.ts` | `App` 应用入口，绑定 Bot 事件并分发消息/互动 |
| `src/command/` | 命令基类、管理器、分词器与参数类型 |
| `src/button/` | 按钮基类、管理器与三类内置按钮 |
| `src/events/` | 事件基类、事件表与内置事件 |
| `src/plugin/` | 插件基类、管理器、上下文与内置插件 |
| `src/scope/` | `ListScope` / `CommandScope` / `WhiteListScope` |
| `src/message/` | 消息类型、发送、撤回与文本互动标记 |
| `src/models/` | `Group`、`User`、`Member` 与成员类型 |
| `src/api/` | 群管理底层 API 封装 |
| `src/utils/` | 通用工具 |
| `demo/` | 覆盖主要功能点的可运行示例 |

修改时请保持模块职责单一，避免让底层模块反向依赖 `App` 等上层对象；需要宿主能力时优先依赖 `BotHost` 等最小接口。

## 4. 代码约定

### 4.1 TypeScript / ESM

- 保持 `tsconfig.json` 的 `strict`、`noImplicitOverride`、`verbatimModuleSyntax` 等开启状态，不通过放宽配置来规避类型问题。
- 相对导入必须带 `.js` 后缀，例如：

```ts
import { Command } from "./command.js";
```

- 仅用于类型的内容使用 `import type`：

```ts
import type { App } from "../app.js";
```

- 使用 Node.js 内置能力时优先使用 `node:` 前缀，例如 `node:fs/promises`、`node:path`。

### 4.2 命名与注释

- 类、接口、类型使用 `PascalCase`；方法、变量使用 `camelCase`；常量使用 `UPPER_SNAKE_CASE`。
- 注释与文档使用中文，技术术语保留英文；只在逻辑不直观处添加注释，避免复述代码。
- 公开 API 需带有简洁的 JSDoc，说明用途、关键参数与返回值语义。

### 4.3 错误处理

- 用户可修正的参数错误，使用 `CommandParamError` 抛出，框架会把错误信息直接回复给用户。
- 不应让单个命令或按钮的异常冒泡到事件循环；可预期的失败应转换为明确的返回值或状态。
- 平台调用失败但无法补救时，遵循现有模块的处理方式（返回 `false`、记录日志或回传 `InteractionStatus.FAILED`），不要静默吞掉非预期异常。

### 4.4 对外 API

- 新增对外能力时，需从 `src/index.ts` 导出，并补充类型声明。
- 公开 API 的变更需同步更新 [README.md](./README.md) 与 [USAGE.md](./USAGE.md)。
- 破坏性变更请先在 Issue 中讨论，并在 PR 描述中明确迁移方式。

### 4.5 代码风格

仓库当前未配置 ESLint / Prettier。请遵循现有文件的缩进、引号、分号与换行风格，避免在功能 PR 中混入大范围格式化改动。

## 5. 常见改动指引

### 5.1 新增命令

1. 继承 `Command`，实现 `name` 与 `handle()`。
2. 按需声明 `params`、`description`、`scope`、`only_at`。
3. 在应用入口通过 `app.commands.register(id, Class)` 注册。

```ts
import {
  Command,
  StringParam,
  type CommandParams,
  type CommandParamDefinesMatch,
} from "node-qqbot-frame";

export class HelloCommand extends Command {
  name = "/hello";
  override description = "回复问候";
  override params: CommandParamDefinesMatch[] = [[["name", StringParam]]];

  handle(params: CommandParams): string {
    return `你好，${params.name as string}`;
  }
}
```

### 5.2 新增按钮

- 需要回调处理时继承 `InteractButton`，并注册到 `app.buttons.register(id, Class)`；注册 ID 必须与实例 `id` 一致。
- 仅跳转或写入指令时分别使用 `LinkButton` / `CommandButton`，无需注册。
- 权限通过 `scope` 声明；按钮点击时框架只校验 `scope.ids`，`only_admin` 会映射为平台权限。

### 5.3 新增插件

- 插件文件必须以 `.ts` 结尾，并导出一个继承 `BasePlugin` 的类；存在多个子类时使用 `default` 导出。
- 在 `onInstall(ctx)` 中通过 `ctx.commands`、`ctx.buttons`、`ctx.events` 注册资源，确保卸载时可自动清理。
- 不要在插件中修改全局状态；需要共享实例时通过构造函数注入。

## 6. 分支与提交

### 6.1 分支命名

从默认分支拉出功能分支，建议使用以下前缀：

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `feat/` | 新功能 | `feat/command-cooldown` |
| `fix/` | 缺陷修复 | `fix/button-scope-check` |
| `docs/` | 文档 | `docs/usage-faq` |
| `refactor/` | 不改变行为的重构 | `refactor/plugin-loader` |
| `chore/` | 构建、依赖、工具 | `chore/update-deps` |

### 6.2 提交信息

使用 Conventional Commits 风格：

```text
<type>(<scope>): <subject>
```

- `type`：`feat`、`fix`、`docs`、`refactor`、`chore` 等。
- `scope` 可选，建议使用模块名，如 `command`、`button`、`plugin`、`scope`、`message`。
- `subject` 简洁描述改动，中文或英文均可。

示例：

```text
feat(command): 支持多组参数模式
fix(button): 修正互动按钮权限校验
docs: 补充插件开发说明
```

保持提交聚焦，不把无关修改、格式化或依赖升级混入同一个提交。

## 7. 提交前检查

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm build` 通过
- [ ] 新增/变更的公开 API 已从 `src/index.ts` 导出
- [ ] 相关文档（README / USAGE）已同步
- [ ] 未提交 `node_modules/`、`dist/`、`.env` 或日志文件
- [ ] 未包含密钥、AppSecret、openid 等敏感信息

## 8. PR 流程

1. Fork 仓库或向维护者申请分支权限。
2. 从默认分支创建功能分支并完成改动。
3. 提交 PR，描述中包含：
   - 改动目的与背景；
   - 主要实现思路；
   - 验证方式（命令、场景或手工步骤）；
   - 是否存在破坏性变更及迁移说明。
4. 回应评审意见；需要调整时在原有分支继续提交。
5. 由维护者确认后合并。

建议控制 PR 规模，一个 PR 只解决一个问题，便于评审与回滚。

## 9. 版本与发布

- 对外 API 变更遵循 Semantic Versioning。
- 发布前需完成 `pnpm typecheck` 与 `pnpm build`，并确认版本号与更新内容一致。

发布流程：

1. 更新 `package.json` 中的 `version`，提交对应改动。
2. 在 GitHub 创建新的 Release，并基于目标提交创建版本 tag（如 `v0.1.0`）。
3. 在 Release 描述中写清更新内容：
   - 新增功能；
   - 缺陷修复；
   - 破坏性变更及迁移方式；
   - 其他需要使用者注意的事项。
4. 发布 Release。
5. 发布后由 GitHub Actions 自动构建并发布到 npm，维护者等待工作流执行完成。
6. 确认 npm 上已出现对应版本，且 GitHub Release、tag 与 `package.json` 版本一致。

注意事项：

- Actions 执行期间不要重复手动发版，避免版本冲突。
- 若 Actions 执行失败，先修复问题，再重新运行工作流或重新发布 Release。
- 发布完成后，如有必要，同步更新 README / USAGE 中的版本相关说明。

## 10. 许可证

向本项目提交代码即表示你同意该贡献以 [MIT License](./LICENSE) 授权。
