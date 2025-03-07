import { usable } from "@bunyjs/ioc";

import ansis, { Ansis } from "ansis";

export interface LoggerConfig {
  name?: string;
  color?: Ansis;
}

@usable()
export class $Logger {
  config?: LoggerConfig;

  constructor(config?: LoggerConfig) {
    this.config = config;
  }

  private get name() {
    return this.config?.name ?? "BunyJS";
  }

  private get color() {
    return this.config?.color ?? ansis.hex("#ffe54f");
  }

  private formatMessage(level: string, color: Ansis) {
    return `${this.color(this.name)} [${color(level)}] ${color(":")}`;
  }

  info = (...messages: any[]) => {
    console.info(this.formatMessage("info", ansis.green), ...messages);
    return this;
  };

  warn = (...messages: any[]) => {
    console.warn(this.formatMessage("warn", ansis.yellow), ...messages);
    return this;
  };

  debug = (...messages: any[]) => {
    console.debug(this.formatMessage("debug", ansis.blue), ...messages);
    return this;
  };

  error = (error: any) => {
    console.error(this.formatMessage("error", ansis.red), error);
    return this;
  };
}
