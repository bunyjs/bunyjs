import { Container } from "./container";
import { Token } from "./token";

export enum Lifetime {
  Singleton = "singleton",
  Transient = "transient",
}

export interface ResolutionConfig {
  lifetime?: Lifetime;
  identifier?: string | symbol;
  properties?: Record<string, string>;
}

export interface ProviderRegisterConfig extends ResolutionConfig {
  token: Token;
  alias?: Token;
}

export interface ProviderResolveConfig<T> extends ResolutionConfig {
  fallback?: T;
  optional?: boolean;
}

export interface ProviderDisposeConfig extends ResolutionConfig {
  remove?: boolean;
}

export abstract class Provider<T = unknown> {
  container: Container;

  config: ProviderRegisterConfig;

  constructor(container: Container, config: ProviderRegisterConfig) {
    this.container = container;
    this.config = config;
  }

  protected mergeResolutionConfig(resolutionConfig?: ResolutionConfig): ResolutionConfig {
    return {
      lifetime: resolutionConfig?.lifetime || this.config.lifetime || Lifetime.Singleton,
      identifier: resolutionConfig?.identifier || this.config.identifier,
      properties: resolutionConfig?.properties || this.config.properties,
    };
  }

  match(config?: ResolutionConfig) {
    if (!config) {
      return true;
    }

    if (config.properties) {
      if (this.config.properties) {
        for (const [key, value] of Object.entries(config.properties)) {
          if (this.config.properties[key] !== value) {
            return false;
          }
        }
      }
    }

    if (config.identifier && this.config.identifier) {
      if (this.config.identifier !== config.identifier) {
        return false;
      }
    }

    return true;
  }

  abstract register: () => Promise<void> | void;
  abstract resolve: (resolutionConfig?: ResolutionConfig) => Promise<T> | T;
  abstract dispose: (resolutionConfig?: ResolutionConfig) => Promise<void> | void;
}
