/**
 * QQ 机器人框架功能演示入口。
 *
 * 覆盖：命令、按钮、scope、插件、事件、快速操作。
 *
 * 运行方式（Node 26 内置 TypeScript 支持，无需安装 tsx / ts-node）：
 *   npm run build       # demo 通过包入口引用框架，需先构建到 dist
 *   node demo/main.ts
 *
 * 凭证从项目根目录 `.env` 读取：QQBOT_APP_ID / QQBOT_APP_SECRET。
 */
import { resolve } from "node:path";
import { QQBot } from "@tencent-connect/qqbot-nodejs";
import { App } from "node-qqbot-frame";

import { AdminNoteButton } from "./buttons/admin-note-button.ts";
import { HelpButton } from "./buttons/help-button.ts";
import { PanelCommand } from "./buttons/panel-command.ts";
import { RollButton } from "./buttons/roll-button.ts";
import { WikiButton } from "./buttons/wiki-button.ts";
import { AdminCommand } from "./commands/admin.ts";
import { AtCommand } from "./commands/at.ts";
import { C2CCommand } from "./commands/c2c.ts";
import { CalcCommand } from "./commands/calc.ts";
import { ConfigCommand } from "./commands/config.ts";
import { EchoCommand } from "./commands/echo.ts";
import { PluginCommand } from "./commands/plugin.ts";
import { BanToCommand } from "./commands/quick-ops/ban-to.ts";
import { DeleteCommand } from "./commands/quick-ops/delete.ts";
import { MemberCommand } from "./commands/quick-ops/member.ts";
import { MuteCommand } from "./commands/quick-ops/mute.ts";
import { PushCommand } from "./commands/quick-ops/push.ts";
import { QuoteCommand } from "./commands/quick-ops/quote.ts";
import { RecallCommand } from "./commands/quick-ops/recall.ts";
import { StreamCommand } from "./commands/quick-ops/stream.ts";
import { TempCommand } from "./commands/quick-ops/temp.ts";
import { UnmuteCommand } from "./commands/quick-ops/unmute.ts";
import { RollCommand } from "./commands/roll.ts";
import { registerEvents } from "./events.ts";

const demoDir = import.meta.dirname;

try {
  process.loadEnvFile(resolve(demoDir, "./.env"));
} catch {
  // 没有 .env 时继续使用外部注入的环境变量
}

const appId = process.env.QQBOT_APP_ID;
const appSecret = process.env.QQBOT_APP_SECRET;

if (!appId || !appSecret) {
  console.error("缺少 QQBOT_APP_ID / QQBOT_APP_SECRET，请在项目根目录的 .env 中配置");
  process.exit(1);
}

const bot = new QQBot({ appId, appSecret, logger: console });
const app = new App(bot, {
  logger: console,
  plugins: {
    root: resolve(demoDir, "plugins"),
    // ListScope：仅自动加载这些 .ts 插件（按文件名去掉后缀匹配）
    autoLoad: ["welcome", "admin-tools"],
  },
});

// 按钮：互动按钮注册到按钮表，跳转 / 指令按钮实例化后用于组装键盘
const helpButton = app.buttons.register("demo_help", HelpButton);
const adminNoteButton = app.buttons.register("demo_admin_note", AdminNoteButton);
const wikiButton = new WikiButton();
const rollButton = new RollButton();

// 命令
app.commands.register("demo_echo", EchoCommand);
app.commands.register("demo_calc", CalcCommand);
app.commands.register("demo_config", ConfigCommand);
app.commands.register("demo_at", AtCommand);
app.commands.register("demo_admin", AdminCommand);
app.commands.register("demo_c2c", C2CCommand);
app.commands.register("demo_roll", RollCommand);
app.commands.register("demo_plugin", PluginCommand);
app.commands.register(
  "demo_panel",
  class extends PanelCommand {
    constructor() {
      super({
        help: helpButton,
        adminNote: adminNoteButton,
        wiki: wikiButton,
        roll: rollButton,
      });
    }
  },
);

// 快速操作命令
app.commands.register("demo_push", PushCommand);
app.commands.register("demo_quote", QuoteCommand);
app.commands.register("demo_recall", RecallCommand);
app.commands.register("demo_temp", TempCommand);
app.commands.register("demo_delete", DeleteCommand);
app.commands.register("demo_stream", StreamCommand);
app.commands.register("demo_member", MemberCommand);
app.commands.register("demo_mute", MuteCommand);
app.commands.register("demo_unmute", UnmuteCommand);
app.commands.register("demo_ban_to", BanToCommand);

// 事件
registerEvents(app);

// 插件：等待自动加载完成，再安装两个内置插件
await app.plugins.ready;
await app.plugins.install("builtin:ping");
await app.plugins.install("builtin:commands");

app.logger.info(`已加载插件：${app.plugins.list().map((item) => item.id).join("、")}`);
app.logger.info("Demo 已启动，发送 /commands 查看当前可用命令");

// 优雅退出
const abort = new AbortController();

function shutdown(signal: string): void {
  app.logger.info(`收到 ${signal}，正在退出`);
  abort.abort();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

try {
  await bot.start(abort.signal);
} catch (error) {
  app.logger.error("启动失败", error);
  process.exitCode = 1;
} finally {
  await app.plugins.uninstallAll();
}
