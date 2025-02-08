import { Container } from "./container";
import { Token } from "./token";

export enum Scope {
  Singleton = "singleton",
  Transient = "transient",
}

export interface ResolutionConfig {
  scope?: Scope;
  target?: string | symbol;
  tags?: Record<string, string>;
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

  protected singleton: T | null = null;
  protected transient: T[] = [];

  protected mergeResolutionConfig(resolutionConfig?: ResolutionConfig): ResolutionConfig {
    return {
      scope: resolutionConfig?.scope || this.config.scope || Scope.Singleton,
      target: resolutionConfig?.target || this.config.target,
      tags: resolutionConfig?.tags || this.config.tags,
    };
  }

  match(config?: ResolutionConfig) {
    if (!config) {
      return true;
    }

    if (config.tags) {
      if (this.config.tags) {
        for (const [key, value] of Object.entries(config.tags)) {
          if (this.config.tags[key] !== value) {
            return false;
          }
        }
      }
    }

    if (config.target && this.config.target) {
      if (this.config.target !== config.target) {
        return false;
      }
    }

    return true;
  }

  abstract register: () => Promise<void> | void;
  abstract resolve: (resolutionConfig?: ResolutionConfig) => Promise<T> | T;
  abstract dispose: (resolutionConfig?: ResolutionConfig) => Promise<void> | void;
}
