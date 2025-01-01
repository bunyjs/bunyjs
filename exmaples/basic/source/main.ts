import { App, init, start, shutdown, bootstrap } from "@bunyjs/app";
import { use, usable } from "@bunyjs/ioc";
import { Logger } from "@bunyjs/logger";

@usable()
class Service {
  @use()
  logger: Logger;

  @init()
  async init() {
    this.logger.info("create connection to database");
  }

  @shutdown()
  async shutdown() {
    this.logger.info("close connection to database");
  }

  createUser() {
    this.logger.info("User created!");
  }

  getUser() {
    this.logger.info("User fetched!");
  }
}

@usable()
class MyApp extends App {
  @use()
  logger: Logger;

  @use()
  service: Service;

  @bootstrap()
  async bootstrap() {
    this.logger.info("MyApp bootstrapped!");
  }

  @init()
  async init() {
    this.logger.info("MyApp initialized!");
    this.service.createUser();
  }

  @start()
  async start() {
    this.logger.info("MyApp started!");
    this.service.getUser();
  }

  @shutdown()
  async shutdown() {
    this.logger.info("MyApp shutdown!");
  }
}

process.on("beforeExit", async () => {
  await MyApp.shutdown();
});

await MyApp.bootstrap({
  logger: {
    name: "App",
  },
});
