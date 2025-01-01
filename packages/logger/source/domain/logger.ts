import { Config } from "@bunyjs/app";
import { use, usable } from "@bunyjs/ioc";
import ansis, { Ansis } from "ansis";

export interface LoggerConfig {
  name?: string;
  color?: Ansis;
}

declare module "@bunyjs/app" {
  interface Config {
    logger?: LoggerConfig;
  }
}

@usable()
export class Logger {
  @use()
  config: Config;

  private get loggerConfig() {
    return this.config.logger ?? {};
  }

  private get name() {
    return this.loggerConfig.name ?? "BunyJS";
  }

  private get color() {
    return this.loggerConfig.color ?? ansis.hex("#ffe54f");
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
