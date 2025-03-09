import { $App, init, start, shutdown } from "@bunyjs/app";
import { use, usable } from "@bunyjs/ioc";
import { $Redis } from "@bunyjs/redis";

@usable()
class Redis extends $Redis {
  constructor() {
    super({
      lazyConnect: true,
      host: "localhost",
      port: 6379,
    });
  }
}

@usable()
class App extends $App {
  @use()
  redis: Redis;

  @init()
  async init() {
    console.log("Initializing...");
    await this.redis.connect();
  }

  @start()
  async start() {
    await this.redis.set("key", "value");
    console.log(await this.redis.get("key"));
  }

  @shutdown()
  async shutdown() {
    console.log("Shutting down...");
    await this.redis.quit();
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
