import { Provider } from "~/domain/provider";

import { ValueRegisterConfig } from "./types";

export class ValueProvider<T> extends Provider<T> {
  config: ValueRegisterConfig<T>;

  resolved: boolean = false;
  disposed: boolean = false;

  async register() {
  }

  async resolve() {
    this.resolved = true;
    return this.config.useValue;
  }

  async dispose() {
    this.disposed = true;
    delete this.config.useValue;
  }
}
