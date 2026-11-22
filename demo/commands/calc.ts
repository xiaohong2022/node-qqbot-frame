/**
 * `/calc <a> <运算> <b>`：演示 FloatParam 与 OptionParam。
 */
import {
  Command,
  FloatParam,
  OptionParam,
  type CommandParamDefinesMatch,
  type CommandParams,
} from "node-qqbot-frame";

export class CalcCommand extends Command {
  name = "/calc";
  override description = "四则运算（浮点数 + 选项参数）";
  override params: CommandParamDefinesMatch[] = [
    [
      ["a", FloatParam],
      ["op", OptionParam({ add: "+", sub: "-", mul: "*", div: "/" })],
      ["b", FloatParam],
    ],
  ];

  handle(params: CommandParams): string {
    const a = params.a as number;
    const b = params.b as number;

    switch (params.op as string) {
      case "add":
        return `${a} + ${b} = ${a + b}`;
      case "sub":
        return `${a} - ${b} = ${a - b}`;
      case "mul":
        return `${a} × ${b} = ${a * b}`;
      case "div":
        return b === 0 ? "除数不能为 0" : `${a} ÷ ${b} = ${a / b}`;
      default:
        return "未知运算符";
    }
  }
}
