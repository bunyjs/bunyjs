import { Container } from "~/domain/container";
import { Token } from "~/domain/token";
import { ResolutionConfig } from "~/main";

import { ClassProvider } from "./provider";

//

export enum DesignMetadata {
  TYPE = "design:type",
  PARAMTYPES = "design:paramtypes",
  RETURNTYPE = "design:returntype",
}

export const metadata = {
  hasMetadata(key: string, target: any, propertyKey?: any): boolean {
    return Reflect.hasMetadata(key, target, propertyKey);
  },
  getMetadata<T>(key: string, target: any, propertyKey?: any): (T | undefined) {
    return Reflect.getMetadata(key, target, propertyKey);
  },
  setMetadata<T>(key: string, value: T, target: any, propertyKey?: any) {
    return Reflect.defineMetadata(key, value, target, propertyKey);
  },
  deleteMetadata(key: string, target: any, propertyKey?: any) {
    return Reflect.deleteMetadata(key, target, propertyKey);
  },
  //
  hasType(target: any, propertyKey?: any): boolean {
    return metadata.hasMetadata(DesignMetadata.TYPE, target, propertyKey);
  },
  getType(target: any, propertyKey?: any): (any | undefined) {
    return metadata.getMetadata(DesignMetadata.TYPE, target, propertyKey);
  },
  setType(value: any, target: any, propertyKey?: any) {
    return metadata.setMetadata(DesignMetadata.TYPE, value, target, propertyKey);
  },
  deleteType(target: any, propertyKey?: any) {
    return metadata.deleteMetadata(DesignMetadata.TYPE, target, propertyKey);
  },
  //
  hasParamTypes(target: any, propertyKey?: any): boolean {
    return metadata.hasMetadata(DesignMetadata.PARAMTYPES, target, propertyKey);
  },
  getParamTypes(target: any, propertyKey?: any): (any[] | undefined) {
    return metadata.getMetadata(DesignMetadata.PARAMTYPES, target, propertyKey);
  },
  setParamTypes(value: any[], target: any, propertyKey?: any) {
    return metadata.setMetadata(DesignMetadata.PARAMTYPES, value, target, propertyKey);
  },
  deleteParamTypes(target: any, propertyKey?: any) {
    return metadata.deleteMetadata(DesignMetadata.PARAMTYPES, target, propertyKey);
  },
  //
  hasReturnType(target: any, propertyKey?: any): boolean {
    return metadata.hasMetadata(DesignMetadata.RETURNTYPE, target, propertyKey);
  },
  getReturnType(target: any, propertyKey?: any): (any | undefined) {
    return metadata.getMetadata(DesignMetadata.RETURNTYPE, target, propertyKey);
  },
  setReturnType(value: any, target: any, propertyKey?: any) {
    return metadata.setMetadata(DesignMetadata.RETURNTYPE, value, target, propertyKey);
  },
  deleteReturnType(target: any, propertyKey?: any) {
    return metadata.deleteMetadata(DesignMetadata.RETURNTYPE, target, propertyKey);
  },
};

export interface FromMetadata<T> {
  has(): boolean;
  get(defaultValue?: T): T | undefined;
  set(value: T): void;
  delete(): boolean;
}

export interface Metadata<T> {
  has(target: any, propertyKey?: any): boolean;
  get(target: any, propertyKey?: any): T | undefined;
  set(value: T, target: any, propertyKey?: any): void;
  delete(target: any, propertyKey?: any): boolean;
  from(target: any, propertyKey?: any): FromMetadata<T>;
}

export const createMetadata = <T>(key: string): Metadata<T> => {
  return {
    has(target, propertyKey?) {
      return metadata.hasMetadata(key, target, propertyKey);
    },
    get(target, propertyKey) {
      return metadata.getMetadata(key, target, propertyKey);
    },
    set(value, target, propertyKey) {
      return metadata.setMetadata(key, value, target, propertyKey);
    },
    delete(target, propertyKey) {
      return metadata.deleteMetadata(key, target, propertyKey);
    },
    from(target, propertyKey) {
      return {
        has() {
          return metadata.hasMetadata(key, target, propertyKey);
        },
        get(defaultValue) {
          return metadata.getMetadata(key, target, propertyKey) ?? defaultValue;
        },
        set(value) {
          return metadata.setMetadata(key, value, target, propertyKey);
        },
        delete() {
          return metadata.deleteMetadata(key, target, propertyKey);
        },
      };
    },
  };
};

export const createMetadataScope = (scope: string) => {
  return <T>(key: string) => {
    return createMetadata<T>(`${scope}:${key}`);
  };
};

//

export const dependenciesMetadata = createMetadata<Token[]>("dependencies");

//

export interface PropertyHandlerContext extends ResolutionConfig {
  container: Container;
}

export interface PropertyMetadata {
  propertyKey: PropertyKey;
  handler: (propertyHandlerContext: PropertyHandlerContext) => Promise<any> | any;
}

export const propertiesMetadata = createMetadata<PropertyMetadata[]>("properties");

//

export interface ParameterHandlerContext extends ResolutionConfig {
  container: Container;
}

export interface ParameterMetadata {
  methodKey?: PropertyKey;
  index: number;
  handler: (parameterHandlerContext: ParameterHandlerContext) => Promise<any> | any;
}

export const parametersMetadata = createMetadata<ParameterMetadata[]>("parameters");

//

export interface RegisterHandlerContext extends ResolutionConfig {
  container: Container;
  provider: ClassProvider<unknown>;
}

export interface RegisterMetadata {
  handler: (registerHandlerContext: RegisterHandlerContext) => Promise<void> | void;
}

export const registersMetadata = createMetadata<RegisterMetadata[]>("registers");

//

export interface ResolveHandlerContext extends ResolutionConfig {
  container: Container;
  provider: ClassProvider<unknown>;
  instance: unknown;
}

export interface ResolveMetadata extends ResolutionConfig {
  handler: (resolveHandlerContext: ResolveHandlerContext) => Promise<void> | void;
}

export const resolversMetadata = createMetadata<ResolveMetadata[]>("resolvers");

//

export interface DisposeHandlerContext extends ResolutionConfig {
  container: Container;
  provider: ClassProvider<unknown>;
  instance: unknown;
}

export interface DisposeMetadata {
  handler: (disposeHandlerContext: DisposeHandlerContext) => Promise<void> | void;
}

export const disposersMetadata = createMetadata<DisposeMetadata[]>("disposers");
