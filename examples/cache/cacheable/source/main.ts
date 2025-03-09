import { $App, init, start } from "@bunyjs/app";
import { $Cacheable } from "@bunyjs/cacheable";
import { use, usable } from "@bunyjs/ioc";

import { CacheableHooks } from "cacheable";

@usable()
class Cacheable extends $Cacheable {
}

@usable()
class Service {
  @Cacheable.hook(CacheableHooks.BEFORE_SET)
  beforeSet(data) {
    console.log(`Setting ${data.key} to ${data.value}`);
  }

  @Cacheable.hook(CacheableHooks.AFTER_SET)
  afterSet(data) {
    console.log(`Set ${data.key} to ${data.value}`);
  }
}

@usable()
class App extends $App {
  @use()
  cacheable: Cacheable;

  @init()
  async initialize() {
    await this.cacheable.set("foo", "bar");
  }

  @start()
  async start() {
    console.log(await this.cacheable.get("foo"));
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
