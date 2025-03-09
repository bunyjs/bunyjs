import type { PipeContext, InterceptorContext } from "@bunyjs/app";
import { $App, init, pipe, $Pipe, start, shutdown, bootstrap, interceptor, $Interceptor } from "@bunyjs/app";
import { use, invoke, usable } from "@bunyjs/ioc";
import { $Logger } from "@bunyjs/logger";

@usable()
class Logger extends $Logger {
}

@usable()
class LoggerIntercept extends $Interceptor {
  @use()
  logger: Logger;

  async intercept(context: InterceptorContext<string>) {
    this.logger.info("LoggerIntercept.before");
    const value = await context.next();
    this.logger.info("LoggerIntercept.after", value);
    return value;
  }
}

@usable()
class UpperCaseIntercept extends $Interceptor {
  @use()
  logger: Logger;

  async intercept(context: InterceptorContext<string>) {
    this.logger.info("UpperCaseIntercept.before");
    const value = await context.next();
    const upperValue = String(value).toUpperCase();
    this.logger.info("UpperCaseIntercept.after", upperValue);
    return upperValue;
  }
}

@usable()
class Pipe1 extends $Pipe {
  @interceptor(LoggerIntercept, UpperCaseIntercept)
  async pipe(context: PipeContext<string>) {
    const value = await context.next();
    return String(value).toUpperCase();
  }
}

@usable()
class Pipe2 extends $Pipe {
  pipe(context: PipeContext<string>) {
    return `Hello, ${context.value}!`;
  }
}

@usable()
class UserRepo {
  @use()
  logger: Logger;

  add(@pipe(Pipe1, Pipe2) name: string) {
    this.logger.info("UserRepo.add", name);
  }
}

@usable()
class App extends $App {
  @use()
  logger: Logger;

  @use()
  userRepo: UserRepo;

  @bootstrap()
  async bootstrap() {
    this.logger.info("App is bootstrapping...");
  }

  @init()
  async init() {
    this.logger.info("App is initializing...");
    invoke({
      target: this.userRepo,
      method: this.userRepo.add,
      args: ["mohammed"],
    });
  }

  @start()
  async start() {
    this.logger.info("App is starting...");
  }

  @shutdown()
  async shutdown() {
    this.logger.info("App is shutting down...");
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
