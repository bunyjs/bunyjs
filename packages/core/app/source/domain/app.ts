import { container } from "@bunyjs/ioc";

import { init, start, shutdown, bootstrap } from "./event";

export enum AppState {
  Idle = "idle",
  Bootstrapped = "bootstrapped",
  Shutdown = "shutdown",
}

export class $App {
  static state = AppState.Idle;

  static async bootstrap() {
    if (this.state === AppState.Bootstrapped) {
      throw new Error("App is already bootstrapped");
    }

    await container.bootstrap();

    await bootstrap.emit(container);

    this.state = AppState.Bootstrapped;

    await init.emit(container);
    await start.emit(container);
  }

  static async shutdown() {
    if (this.state === AppState.Shutdown) {
      throw new Error("App is already shutdown");
    }

    await shutdown.emit(container);
    await container.shutdown();

    this.state = AppState.Shutdown;
  }
}
