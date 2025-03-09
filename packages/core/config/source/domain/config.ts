export class $Config<T = Record<PropertyKey, unknown>> {
  source: T;

  constructor(config: T) {
    this.source = config;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.source[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.source[key] = value;
  }
}
