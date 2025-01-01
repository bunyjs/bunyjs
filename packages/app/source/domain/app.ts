import { container } from "@bunyjs/ioc";

import { Config } from "./config";
import { init, start, shutdown, bootstrap } from "./event";

export enum AppState {
  Idle = "idle",
  Bootstrapped = "bootstrapped",
  Shutdown = "shutdown",
}

export class App {
  static state = AppState.Idle;

  static async bootstrap(config?: Config) {
    if (this.state === AppState.Bootstrapped) {
      throw new Error("App is already bootstrapped");
    }

    await container.bootstrap();

    await bootstrap.emit(container);
    await init.emit(container);
    await start.emit(container);

    this.state = AppState.Bootstrapped;
  }

  static async shutdown() {
    if (this.state === AppState.Shutdown) {
      throw new Error("App is already shut down");
    }

    await shutdown.emit(container);
    await container.shutdown();

    this.state = AppState.Shutdown;
  }
}
