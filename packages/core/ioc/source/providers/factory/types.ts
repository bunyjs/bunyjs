import { ResolutionConfig, ProviderRegisterConfig } from "~/domain/provider";

export interface FactoryCreateContext<T> extends ResolutionConfig {
}

export type Factory<T> = (context: FactoryCreateContext<T>) => T;

export interface FactoryRegisterConfig<T> extends ProviderRegisterConfig {
  useFactory: Factory<T>;
}
