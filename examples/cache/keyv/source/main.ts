import { $App, init, start } from "@bunyjs/app";
import { use, usable } from "@bunyjs/ioc";
import { $Keyv } from "@bunyjs/keyv";

@usable()
class Keyv extends $Keyv {
}

@usable()
class App extends $App {
  @use()
  keyv: Keyv;

  @init()
  async initialize() {
    await this.keyv.set("foo", "bar");
  }

  @start()
  async start() {
    console.log(await this.keyv.get("foo"));
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
