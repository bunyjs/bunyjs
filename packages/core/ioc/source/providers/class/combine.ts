import { DecoratorSignature } from "./decorator";

export const combine = (...decorators: DecoratorSignature[]): DecoratorSignature => {
  return (target, key, descriptor) => {
    for (const decorator of decorators) {
      decorator(target, key, descriptor);
    }
  };
};
