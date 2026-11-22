/**
 * 跳转按钮：点击直接打开链接，不会触发 interaction 事件。
 */
import { ButtonStyle, LinkButton } from "node-qqbot-frame";

export class WikiButton extends LinkButton {
  id = "demo_wiki";
  label = "官方文档";
  style = ButtonStyle.NORMAL;
  link = "https://bot.q.qq.com/wiki/";
  override unsupport_tips = "当前版本不支持跳转，请升级 QQ";
}
