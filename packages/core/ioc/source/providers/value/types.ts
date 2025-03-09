import { ProviderRegisterConfig } from "~/domain/provider";

export type Value<T> = T;

export interface ValueRegisterConfig<T> extends ProviderRegisterConfig {
  useValue: Value<T>;
}
