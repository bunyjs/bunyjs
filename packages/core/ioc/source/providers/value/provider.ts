import { Provider, ResolutionConfig } from "~/domain/provider";

import { ValueRegisterConfig } from "./types";

export class ValueProvider<T> extends Provider<T> {
  declare config: ValueRegisterConfig<T>;

  register = () => {
  };

  resolve = (resolutionConfig?: ResolutionConfig) => {
    return this.config.useValue;
  };

  dispose = () => {
  };
}
