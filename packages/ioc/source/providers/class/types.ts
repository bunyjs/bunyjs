import { ProviderRegisterConfig } from "~/domain/provider";

export type Class<T = unknown> = (new (...args: any[]) => T) | (abstract new (...args: any[]) => T);

export enum ClassScope {
  Singleton = "singleton",
  Transient = "transient",
}

export interface ClassRegisterConfig<T = unknown> extends ProviderRegisterConfig {
  useClass: (new (...args: any[]) => T);
  scope?: ClassScope;
}