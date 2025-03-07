type Context<T = unknown> = {
  value: T;
};

type Handler<T = unknown, P extends any[] = any[]> = (...args: P) => {
  callback: (context: Context<T>) => void;
};

const createDecorator = <T = unknown, P extends any[] = any[]>(handler: Handler<T, P>) => {
  return (...args: P) => {
    const result = handler(...args);
    return result.callback;
  };
};

const decorator = createDecorator((arg: { name: string; age: number; }) => ({
  callback: (context) => {
    console.log(context.value);
  },
}));

const callback = decorator({
  name: "test",
  age: 10,
});

callback({
  value: 10,
});
