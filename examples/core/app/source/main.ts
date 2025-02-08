import { $App, init, start, shutdown, bootstrap } from "@bunyjs/app";
import { usable } from "@bunyjs/ioc";

@usable()
class App extends $App {
  @bootstrap()
  async bootstrap() {
    console.log("App is bootstrapping...");
  }

  @init()
  async init() {
    console.log("App is initializing...");
  }

  @start()
  async start() {
    console.log("App is starting...");
  }

  @shutdown()
  async shutdown() {
    console.log("App is shutting down...");
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
