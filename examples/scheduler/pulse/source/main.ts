import { $App } from "@bunyjs/app";
import { usable } from "@bunyjs/ioc";

@usable()
class App extends $App {
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
