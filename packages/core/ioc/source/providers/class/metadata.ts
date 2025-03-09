import { Container } from "~/domain/container";
import { Token } from "~/domain/token";
import { ClassProvider, ResolutionConfig } from "~/main";


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

//

export interface MetadataAccessor<T> {
  has: () => boolean;
  get: (defaultValue?: T) => T | undefined;
  set: (value: T) => void;
  update: (updater: (value: T | undefined) => T) => void;
  delete: () => boolean;
}

export const createMetadataAccessor = <T>(key: string, target: any, propertyKey?: PropertyKey): MetadataAccessor<T> => ({
  has: () => {
    return metadata.hasMetadata(key, target, propertyKey);
  },
  get: (defaultValue?: T) => {
    if (metadata.hasMetadata(key, target, propertyKey)) {
      return metadata.getMetadata(key, target, propertyKey);
    }

    return defaultValue;
  },
  set: (value: T) => {
    return metadata.setMetadata(key, value, target, propertyKey);
  },
  update: (updater: (value: T | undefined) => T) => {
    const value = metadata.getMetadata<T>(key, target, propertyKey);
    return metadata.setMetadata(key, updater(value), target, propertyKey);
  },
  delete: () => {
    return metadata.deleteMetadata(key, target, propertyKey);
  },
});

export interface MetadataOperator<T> {
  for: (target: any, propertyKey?: PropertyKey) => MetadataAccessor<T>;
  has: (target: any, propertyKey?: PropertyKey) => boolean;
  get: (target: any, propertyKey?: PropertyKey) => T | undefined;
  set: (value: T, target: any, propertyKey?: PropertyKey) => void;
  delete: (target: any, propertyKey?: PropertyKey) => boolean;
}

export const createMetadataOperator = <T>(key: string): MetadataOperator<T> => ({
  for: (target: any, propertyKey?: PropertyKey) => createMetadataAccessor<T>(key, target, propertyKey),
  has: (target: any, propertyKey?: PropertyKey) => metadata.hasMetadata(key, target, propertyKey),
  get: (target: any, propertyKey?: PropertyKey) => metadata.getMetadata(key, target, propertyKey),
  set: (value: T, target: any, propertyKey?: PropertyKey) => metadata.setMetadata(key, value, target, propertyKey),
  delete: (target: any, propertyKey?: PropertyKey) => metadata.deleteMetadata(key, target, propertyKey),
});

//

export interface ArrayMetadataAccessor<T> {
  has: () => boolean;
  get: () => T[];
  set: (value: T[]) => void;
  add: (...value: T[]) => void;
  remove: (...value: T[]) => void;
  update: (updater: (value: T[]) => T[]) => void;
  clear: () => void;
}

export const createArrayMetadataAccessor = <T>(key: string, target: any, propertyKey?: PropertyKey): ArrayMetadataAccessor<T> => ({
  has: () => {
    return metadata.hasMetadata(key, target, propertyKey);
  },
  get: () => {
    return metadata.getMetadata<T[]>(key, target, propertyKey) || [];
  },
  set: (value: T[]) => {
    return metadata.setMetadata(key, value, target, propertyKey);
  },
  add: (...value: T[]) => {
    const array = metadata.getMetadata<T[]>(key, target, propertyKey) || [];
    metadata.setMetadata(key, array.concat(value), target, propertyKey);
  },
  remove: (...value: T[]) => {
    const array = metadata.getMetadata<T[]>(key, target, propertyKey) || [];
    metadata.setMetadata(key, array.filter((item) => !value.includes(item)), target, propertyKey);
  },
  update: (updater: (value: T[]) => T[]) => {
    const array = metadata.getMetadata<T[]>(key, target, propertyKey) || [];
    metadata.setMetadata(key, updater(array), target, propertyKey);
  },
  clear: () => {
    return metadata.setMetadata(key, [], target, propertyKey);
  },
});

export interface ArrayMetadataOperator<T> {
  for: (target: any, propertyKey?: PropertyKey) => ArrayMetadataAccessor<T>;
  has: (target: any, propertyKey?: PropertyKey) => boolean;
  get: (target: any, propertyKey?: PropertyKey) => T[];
  set: (value: T[], target: any, propertyKey?: PropertyKey) => void;
  delete: (target: any, propertyKey?: PropertyKey) => boolean;
}

export const createArrayMetadataOperator = <T>(key: string): ArrayMetadataOperator<T> => ({
  for: (target: any, propertyKey?: PropertyKey) => createArrayMetadataAccessor<T>(key, target, propertyKey),
  has: (target: any, propertyKey?: PropertyKey) => metadata.hasMetadata(key, target, propertyKey),
  get: (target: any, propertyKey?: PropertyKey) => metadata.getMetadata<T[]>(key, target, propertyKey) || [],
  set: (value: T[], target: any, propertyKey?: PropertyKey) => metadata.setMetadata(key, value, target, propertyKey),
  delete: (target: any, propertyKey?: PropertyKey) => metadata.deleteMetadata(key, target, propertyKey),
});

//

export const createMetadataScope = (scope: string) => ({
  operator<T>(key: string): MetadataOperator<T> {
    return createMetadataOperator<T>(`${scope}:${key}`);
  },
  arrayOperator<T>(key: string): ArrayMetadataOperator<T> {
    return createArrayMetadataOperator<T>(`${scope}:${key}`);
  },
});

//

export const dependenciesMetadata = createArrayMetadataOperator<Token>("dependencies");

//

export interface TransformHandlerContext extends ResolutionConfig {
  container: Container;
  value: any;
}

export interface PropertyTransformMetadata {
  propertyKey: PropertyKey;
  handler: (transformHandlerContext: TransformHandlerContext) => Promise<any> | any;
}

export const propertiesMetadata = createArrayMetadataOperator<PropertyTransformMetadata>("properties");

export interface ParameterTransformMetadata {
  propertyKey: PropertyKey;
  parameterIndex: number;
  handler: (transformHandlerContext: TransformHandlerContext) => Promise<any> | any;
}

export const parametersMetadata = createArrayMetadataOperator<ParameterTransformMetadata>("parameters");

//

export interface InterceptorContext extends ResolutionConfig {
  container: Container;
  next: () => Promise<any>;
}

export interface InterceptMetadata {
  handler: (interceptorContext: InterceptorContext) => Promise<any> | any;
}

export const interceptorsMetadata = createArrayMetadataOperator<InterceptMetadata>("interceptors");

//

export interface RegisterHandlerContext extends ResolutionConfig {
  container: Container;
  provider: ClassProvider<any>;
}

export interface RegisterMetadata {
  handler: (registerHandlerContext: RegisterHandlerContext) => Promise<void> | void;
}

export const registersMetadata = createArrayMetadataOperator<RegisterMetadata>("registers");

//

export interface ResolveHandlerContext extends ResolutionConfig {
  container: Container;
  provider: ClassProvider<any>;
  instance: any;
}

export interface ResolveMetadata extends ResolutionConfig {
  handler: (resolveHandlerContext: ResolveHandlerContext) => Promise<void> | void;
}

export const resolversMetadata = createArrayMetadataOperator<ResolveMetadata>("resolvers");

//

export interface DisposeHandlerContext extends ResolutionConfig {
  container: Container;
  provider: ClassProvider<any>;
  instance: any;
}

export interface DisposeMetadata {
  handler: (disposeHandlerContext: DisposeHandlerContext) => Promise<void> | void;
}

export const disposersMetadata = createArrayMetadataOperator<DisposeMetadata>("disposers");
