import type { ButtonStyle } from "../button/button-style.js";

/** 按钮渲染数据。 */
export interface IButtonRenderData {
  label: string;
  visited_label?: string;
  style: ButtonStyle | number;
}

/** 按钮权限。type：0=指定用户，1=管理员，2=所有人。 */
export interface IButtonPermission {
  type: number;
  specify_user_ids?: string[];
}

/** 按钮二次确认弹窗。 */
export interface IButtonModal {
  content?: string;
  confirm_text?: string;
  cancel_text?: string;
}

/** 按钮点击行为。type：0=跳转按钮，1=回调按钮，2=指令按钮。 */
export interface IButtonAction {
  type: number;
  permission?: IButtonPermission;
  data?: string;
  /** 版本过低时的提示文案。 */
  unsupport_tips?: string;
  /** 指令按钮：点击后直接发送 data，仅单聊可用，默认 false。 */
  enter?: boolean;
  /** 指令按钮：指令是否带引用回复本消息，默认 false。 */
  reply?: boolean;
  /** 指令按钮：设置后忽略 enter，1 表示唤起选图器（仅手机端单聊）。 */
  anchor?: number;
  /** 已废弃：可点击次数限制，0 表示无限。 */
  click_limit?: number;
  modal?: IButtonModal;
  [key: string]: unknown;
}

/** QQ 平台按钮对象。 */
export interface IButton {
  id: string;
  render_data: IButtonRenderData;
  action: IButtonAction;
  group_id?: string;
  [key: string]: unknown;
}

/** QQ 平台图文卡片。 */
export interface IMessageCard {
  type: string;
  content: Record<string, unknown>;
  [key: string]: unknown;
}

/** 纯文本消息。 */
export interface TextMessage {
  type: "text";
  text: string;
}

/** Markdown 消息，可携带内嵌键盘。 */
export interface MarkdownMessage {
  type: "markdown";
  markdown: string | string[];
  keyboard?: IButton[][];
}

/** 富媒体消息（file_info 来自上传接口）。 */
export interface MediaMessage {
  type: "media";
  file_info: string;
}

/** 图文卡片消息。 */
export interface CardMessage {
  type: "card";
  card: IMessageCard;
}

export type Message = TextMessage | MarkdownMessage | MediaMessage | CardMessage;

export type MessageContent = string | Message;

export function toTextMessage(content: string): TextMessage {
  return { type: "text", text: content };
}
