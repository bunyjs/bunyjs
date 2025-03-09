import { Class } from "~/providers/class";
import { Factory } from "~/providers/factory";

export type Token<T = unknown> = string | symbol | Class<T> | Factory<T>;

export type Ref<T = unknown> = Token<T> | (() => Token<T>);

export const ref = <T>(ref: () => Token<T>) => {
  Reflect.set(ref, "ref", true);
  return ref;
};

export const isRef = <T>(ref: Ref<T>): ref is (() => Token<T>) => {
  if (typeof ref === "function") {
    return Reflect.get(ref, "ref");
  }

  return false;
};

export const createToken = <T>(ref?: Ref<T>): Token<T> => {
  if (ref) {
    if (isRef(ref)) {
      return ref();
    }

    return ref;
  }

  return Symbol();
};

export const tokenStringify = <T>(ref: Ref<T>): string => {
  const token = createToken(ref);

  if (typeof token === "function") {
    return token.name;
  }

  return String(token);
};
