import { Container } from "./container";
import { Token } from "./token";

export interface ResolutionConfig {
  tags?: Record<string, string>;
  target?: string | symbol;
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

  abstract resolved: boolean;
  abstract disposed: boolean;

  abstract config: ProviderRegisterConfig;

  private matchTags(tags?: Record<string, string>) {
    if (!tags) {
      return true;
    }

    if (!this.config.tags) {
      return true;
    }

    for (const [key, value] of Object.entries(tags)) {
      if (this.config.tags[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private matchTarget(target?: string | symbol) {
    if (!target) {
      return true;
    }

    if (!this.config.target) {
      return true;
    }

    return this.config.target === target;
  }

  match(config?: ResolutionConfig) {
    if (!config) {
      return true;
    }

    if (!this.matchTags(config.tags)) {
      return false;
    }

    if (!this.matchTarget(config.target)) {
      return false;
    }

    return true;
  }

  abstract register(): Promise<void>;

  abstract resolve(resolutionConfig?: ResolutionConfig): Promise<T>;

  abstract dispose(resolutionConfig?: ResolutionConfig): Promise<void>;
}
