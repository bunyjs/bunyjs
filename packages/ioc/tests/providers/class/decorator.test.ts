import { it, vi, expect, describe } from "vitest";

import { container, DecoratorType, DecoratorLevel, createDecorator, parametersMetadata, propertiesMetadata, createDecoratorScope, dependenciesMetadata } from "~/main";

describe("Decorator", () => {
  describe("createDecorator", () => {
    describe("context", () => {
      it("should compute decorator type correctly", () => {
        const test = createDecorator("test", () => ({
          onInit: {
            [DecoratorType.Class]: (context) => {
              expect(context.target).toBe(Test);
              expect(context.type).toBe(DecoratorType.Class);
            },
            [DecoratorType.Parameter]: (context) => {
              expect(context.target).toBe(Test);
              expect(context.propertyKey).toBe(undefined);
              expect(context.descriptor).toBe(0);
              expect(context.type).toBe(DecoratorType.Parameter);
            },
            [DecoratorType.Method]: (context) => {
              expect(context.target).toBe(Test.prototype);
              expect(context.propertyKey).toBe("method");
              expect(context.type).toBe(DecoratorType.Method);
            },
            [DecoratorType.StaticMethod]: (context) => {
              expect(context.target).toBe(Test);
              expect(context.propertyKey).toBe("staticMethod");
              expect(context.type).toBe(DecoratorType.StaticMethod);
            },
            [DecoratorType.Property]: (context) => {
              expect(context.target).toBe(Test.prototype);
              expect(context.propertyKey).toBe("property");
              expect(context.type).toBe(DecoratorType.Property);
            },
            [DecoratorType.StaticProperty]: (context) => {
              expect(context.target).toBe(Test);
              expect(context.propertyKey).toBe("staticProperty");
              expect(context.type).toBe(DecoratorType.StaticProperty);
            },
            [DecoratorType.Getter]: (context) => {
              expect(context.target).toBe(Test.prototype);
              expect(context.propertyKey).toBe("getter");
              expect(context.type).toBe(DecoratorType.Getter);
            },
            [DecoratorType.StaticGetter]: (context) => {
              expect(context.target).toBe(Test);
              expect(context.propertyKey).toBe("staticGetter");
              expect(context.type).toBe(DecoratorType.StaticGetter);
            },
            [DecoratorType.Setter]: (context) => {
              expect(context.target).toBe(Test.prototype);
              expect(context.propertyKey).toBe("setter");
              expect(context.type).toBe(DecoratorType.Setter);
            },
            [DecoratorType.StaticSetter]: (context) => {
              expect(context.target).toBe(Test);
              expect(context.propertyKey).toBe("staticSetter");
              expect(context.type).toBe(DecoratorType.StaticSetter);
            },
          },
        }));

        @test()
        class Test {
          @test()
          property: string;

          @test()
          static staticProperty: string;

          @test()
          get getter() {
            return "getter";
          }

          @test()
          static get staticGetter() {
            return "staticGetter";
          }

          @test()
          set setter(value: string) {
          }

          @test()
          static set staticSetter(value: string) {
          }

          constructor(@test() parameter: string) {
          }

          @test()
          method() {
          }

          @test()
          static staticMethod() {
          }
        }

        expect(Test).toBeDefined();
      });

      it("should compute decorator level correctly", () => {
        const test = createDecorator("test", () => ({
          onInit: {
            [DecoratorType.Class]: (context) => {
              expect(context.level).toBe(DecoratorLevel.Static);
            },
            [DecoratorType.Method]: (context) => {
              expect(context.level).toBe(DecoratorLevel.Instance);
            },
          },
        }));

        @test()
        class Test {
          @test()
          method() {
          }
        }

        expect(Test).toBeDefined();
      });

      it("should compute className correctly", () => {
        const test = createDecorator("test", () => ({
          onInit: (context) => {
            expect(context.className).toBe("Test");
          },
        }));

        @test()
        class Test {
          @test()
          test: string;

          @test()
          static test() {
          }
        }

        expect(Test).toBeDefined();
      });

      it("should compute decoratorName correctly", () => {
        const test = createDecorator("test", () => ({
          onInit: (context) => {
            expect(context.decoratorName).toBe("@test");
          },
        }));

        @test()
        class Test {
        }

        expect(Test).toBeDefined();
      });

      it("should compute decoratorPath correctly", () => {
        const classTest = createDecorator("test", () => ({
          onInit: (context) => {
            expect(context.decoratorPath).toBe("Test");
          },
        }));

        const methodTest = createDecorator("test", () => ({
          onInit: (context) => {
            expect(context.decoratorPath).toBe("Test.test");
          },
        }));

        @classTest()
        class Test {
          @methodTest()
          test() {
          }
        }

        expect(Test).toBeDefined();
      });

      it("should add dependencies to dependenciesMetadata", () => {
        const test = createDecorator("test", () => ({
          onInit: (context) => {
            context.addDependency("TestDependency1", "TestDependency2");
            context.addDependency("TestDependency3");
            const dependencies = dependenciesMetadata.get(Test) ?? [];
            expect(dependencies).toEqual(["TestDependency1", "TestDependency2", "TestDependency3"]);
          },
        }));

        @test()
        class Test {
        }

        expect(Test).toBeDefined();
      });

      it("should add parameter to parametersMetadata", () => {
        const test = createDecorator("test", () => ({
          onInit: (context) => {
            context.addParameter({
              index: 0,
              methodKey: "test",
              handler: () => {
                return "TestParameter";
              },
            });

            const parameters = parametersMetadata.get(Test.prototype, "test") ?? [];

            expect(parameters).toEqual([{
              index: 0,
              methodKey: "test",
              handler: expect.any(Function),
            }]);
          },
        }));

        class Test {
          @test()
          test(test: string) {
          }
        }

        expect(Test).toBeDefined();
      });

      it("should add property to propertiesMetadata", () => {
        const test = createDecorator("test", () => ({
          onInit: (context) => {
            context.addProperty({
              propertyKey: "test",
              handler: () => {
                return "TestProperty";
              },
            });

            const properties = propertiesMetadata.get(Test.prototype) ?? [];

            expect(properties).toEqual([{
              propertyKey: "test",
              handler: expect.any(Function),
            }]);
          },
        }));

        class Test {
          @test()
          test: string;
        }

        expect(Test).toBeDefined();
      });
    });

    describe("apply", () => {
      it("should enforce decorator type constraints", () => {
        const test = createDecorator("test", () => ({
          apply: DecoratorType.Property,
        }));

        expect(() => {
          @test()
          class Test { }
        }).toThrowError('Error in decorator "@test" at "Test": Must be applied to Property, but got "Class"');

        expect(() => {
          class Test {
            @test()
            test: string;
          }
        }).not.toThrowError();
      });
    });

    describe("instance", () => {
      it("should enforce decorator instance constraints", () => {
        abstract class Animal {
        }

        const test = createDecorator("test", () => ({
          instance: Animal,
        }));

        expect(() => {
          @test()
          class Test { }
        }).toThrowError('Error in decorator "@test" at "Test": Must be applied to an instance of "Animal"');

        expect(() => {
          class Dog extends Animal {
            @test()
            test: string;
          }
        }).not.toThrowError();
      });
    });

    describe("pre", () => {
      it("should call pre when decorator is applied", () => {
        const preHandler = vi.fn();

        const preTest = createDecorator("preTest", () => ({
          onInit: preHandler,
        }));
        const test = createDecorator("test", () => ({
          pre: preTest(),
        }));

        expect(preHandler).not.toHaveBeenCalled();

        @test()
        class Test { }

        expect(preHandler).toHaveBeenCalled();
      });

      it("should call pre only if the decorator type matches", () => {
        const preHandler = vi.fn();

        const preTest = createDecorator("preTest", () => ({
          onInit: preHandler,
        }));
        const test = createDecorator("test", () => ({
          pre: {
            [DecoratorType.Class]: preTest(),
            [DecoratorType.Method]: [
              preTest(),
            ],
          },
        }));

        expect(preHandler).not.toHaveBeenCalled();

        @test()
        class Test {
          @test()
          property: string;

          @test()
          method() {
          }
        }

        expect(preHandler).toHaveBeenCalledTimes(2);
      });

      it("should handle error when pre throws", () => {
        const preHandler = vi.fn(() => {
          throw new Error("TestError");
        });

        const preTest = createDecorator("preTest", () => ({
          onInit: preHandler,
        }));
        const test = createDecorator("test", () => ({
          pre: [
            preTest(),
          ],
        }));

        expect(preHandler).not.toHaveBeenCalled();

        expect(() => {
          @test()
          class Test { }
        }).toThrowError('Error in pre decorator "preTest" (used by "@test" at "Test"): Init failed for decorator "@preTest" at "Test": TestError');
      });
    });

    describe("post", () => {
      it("should call post when decorator is applied", () => {
        const postHandler = vi.fn();

        const postTest = createDecorator("postTest", () => ({
          onInit: postHandler,
        }));
        const test = createDecorator("test", () => ({
          post: postTest(),
        }));

        expect(postHandler).not.toHaveBeenCalled();

        @test()
        class Test { }

        expect(postHandler).toHaveBeenCalled();
      });

      it("should call post only if the decorator type matches", () => {
        const postHandler = vi.fn();

        const postTest = createDecorator("postTest", () => ({
          onInit: postHandler,
        }));
        const test = createDecorator("test", () => ({
          post: {
            [DecoratorType.Class]: postTest(),
            [DecoratorType.Method]: [
              postTest(),
            ],
          },
        }));

        expect(postHandler).not.toHaveBeenCalled();

        @test()
        class Test {
          @test()
          property: string;

          @test()
          method() {
          }
        }

        expect(postHandler).toHaveBeenCalledTimes(2);
      });

      it("should handle error when post throws", () => {
        const postHandler = vi.fn(() => {
          throw new Error("TestError");
        });

        const postTest = createDecorator("postTest", () => ({
          onInit: postHandler,
        }));
        const test = createDecorator("test", () => ({
          post: [
            postTest(),
          ],
        }));

        expect(postHandler).not.toHaveBeenCalled();

        expect(() => {
          @test()
          class Test { }
        }).toThrowError('Error in post decorator "postTest" (used by "@test" at "Test"): Init failed for decorator "@postTest" at "Test": TestError');
      });
    });

    describe("onInit", () => {
      it("should call onInit when decorator is applied", () => {
        const initHandler = vi.fn();

        const test = createDecorator("test", () => ({
          onInit: initHandler,
        }));

        expect(initHandler).not.toHaveBeenCalled();

        @test()
        class Test { }

        expect(initHandler).toHaveBeenCalled();
      });

      it("should call onInit only if the decorator type matches", () => {
        const initHandler = vi.fn();

        const test = createDecorator("test", () => ({
          onInit: {
            [DecoratorType.Class]: initHandler,
          },
        }));

        expect(initHandler).not.toHaveBeenCalled();

        @test()
        class Test {
          @test()
          test: string;
        }

        expect(initHandler).toHaveBeenCalledTimes(1);
      });

      it("should handle error when onInit throws", () => {
        const initHandler = vi.fn(() => {
          throw new Error("TestError");
        });

        const test = createDecorator("test", () => ({
          onInit: initHandler,
        }));

        expect(initHandler).not.toHaveBeenCalled();

        expect(() => {
          @test()
          class Test { }
        }).toThrowError('Init failed for decorator "@test" at "Test": TestError');
      });
    });

    describe("onBootstrap", () => {
      it("should call onBootstrap when container bootstraps", async () => {
        const bootstrapSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onBootstrap: bootstrapSpy,
        }));

        @test()
        class Test {
        }

        expect(bootstrapSpy).not.toHaveBeenCalled();

        await container.bootstrap();

        expect(bootstrapSpy).toHaveBeenCalledTimes(1);
      });

      it("should call onBootstrap only if the decorator type matches", async () => {
        const bootstrapSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onBootstrap: {
            [DecoratorType.Class]: bootstrapSpy,
          },
        }));

        @test()
        class Test {
          @test()
          test: string;
        }

        expect(bootstrapSpy).not.toHaveBeenCalled();

        await container.bootstrap();

        expect(bootstrapSpy).toHaveBeenCalledTimes(1);
      });

      it("should handle error when onBootstrap throws", async () => {
        const bootstrapSpy = vi.fn(() => {
          throw new Error("TestError");
        });

        const test = createDecorator("test", () => ({
          onBootstrap: bootstrapSpy,
        }));

        @test()
        class Test {
        }

        expect(bootstrapSpy).not.toHaveBeenCalled();

        await expect(container.bootstrap()).rejects.toThrowError('Bootstrap failed for decorator "@test" at "Test": TestError');
      });
    });

    describe("onShutdown", () => {
      it("should call onShutdown when container shuts down", async () => {
        const shutdownSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onShutdown: shutdownSpy,
        }));

        @test()
        class Test {
        }

        expect(shutdownSpy).not.toHaveBeenCalled();

        await container.shutdown();

        expect(shutdownSpy).toHaveBeenCalledTimes(1);
      });

      it("should call onShutdown only if the decorator type matches", async () => {
        const shutdownSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onShutdown: {
            [DecoratorType.Class]: shutdownSpy,
          },
        }));

        @test()
        class Test {
          @test()
          test: string;
        }

        expect(shutdownSpy).not.toHaveBeenCalled();

        await container.shutdown();

        expect(shutdownSpy).toHaveBeenCalledTimes(1);
      });

      it("should handle error when onShutdown throws", async () => {
        const shutdownSpy = vi.fn(() => {
          throw new Error("TestError");
        });

        const test = createDecorator("test", () => ({
          onShutdown: shutdownSpy,
        }));

        @test()
        class Test {
        }

        expect(shutdownSpy).not.toHaveBeenCalled();

        await expect(container.shutdown()).rejects.toThrowError('Shutdown failed for decorator "@test" at "Test": TestError');
      });
    });

    describe("onRegister", () => {
      it("should call onRegister when decorator is registered", async () => {
        const registerSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onRegister: registerSpy,
        }));

        expect(registerSpy).not.toHaveBeenCalled();

        @test()
        class Test {
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        expect(registerSpy).toHaveBeenCalledTimes(1);
      });

      it("should call onRegister only if the decorator type matches", async () => {
        const registerSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onRegister: {
            [DecoratorType.Class]: registerSpy,
          },
        }));

        expect(registerSpy).not.toHaveBeenCalled();

        @test()
        class Test {
          @test()
          test: string;
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        expect(registerSpy).toHaveBeenCalledTimes(1);
      });

      it("should handle error when onRegister throws", async () => {
        const registerSpy = vi.fn(() => {
          throw new Error("TestError");
        });

        const test = createDecorator("test", () => ({
          onRegister: registerSpy,
        }));

        expect(registerSpy).not.toHaveBeenCalled();

        @test()
        class Test {
        }

        await expect(container.register({
          token: Test,
          useClass: Test,
        })).rejects.toThrowError('Register failed for decorator "@test" at "Test": TestError');
      });
    });

    describe("onResolve", () => {
      it("should call onResolve when decorator is resolved", async () => {
        const resolveSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onResolve: resolveSpy,
        }));

        expect(resolveSpy).not.toHaveBeenCalled();

        @test()
        class Test {
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        await container.resolve(Test);

        expect(resolveSpy).toHaveBeenCalledTimes(1);
      });

      it("should call onResolve only if the decorator type matches", async () => {
        const resolveSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onResolve: {
            [DecoratorType.Class]: resolveSpy,
          },
        }));

        expect(resolveSpy).not.toHaveBeenCalled();

        @test()
        class Test {
          @test()
          test: string;
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        await container.resolve(Test);

        expect(resolveSpy).toHaveBeenCalledTimes(1);
      });

      it("should handle error when onResolve throws", async () => {
        const resolveSpy = vi.fn(() => {
          throw new Error("TestError");
        });

        const test = createDecorator("test", () => ({
          onResolve: resolveSpy,
        }));

        expect(resolveSpy).not.toHaveBeenCalled();

        @test()
        class Test {
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        await expect(container.resolve(Test)).rejects.toThrowError('Resolve failed for decorator "@test" at "Test": TestError');
      });
    });

    describe("onDispose", () => {
      it("should call onDispose when decorator is disposed", async () => {
        const disposeSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onDispose: disposeSpy,
        }));

        expect(disposeSpy).not.toHaveBeenCalled();

        @test()
        class Test {
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        await container.resolve(Test);

        await container.dispose(Test);

        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });

      it("should call onDispose only if the decorator type matches", async () => {
        const disposeSpy = vi.fn();

        const test = createDecorator("test", () => ({
          onDispose: {
            [DecoratorType.Class]: disposeSpy,
          },
        }));

        expect(disposeSpy).not.toHaveBeenCalled();

        @test()
        class Test {
          @test()
          test: string;
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        await container.resolve(Test);
        await container.dispose(Test);

        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });

      it("should handle error when onDispose throws", async () => {
        const disposeSpy = vi.fn(() => {
          throw new Error("TestError");
        });

        const test = createDecorator("test", () => ({
          onDispose: disposeSpy,
        }));

        expect(disposeSpy).not.toHaveBeenCalled();

        @test()
        class Test {
        }

        await container.register({
          token: Test,
          useClass: Test,
        });

        await container.resolve(Test);

        await expect(container.dispose(Test)).rejects.toThrowError('Dispose failed for decorator "@test" at "Test": TestError');
      });
    });
  });

  describe("createDecoratorScope", () => {
    it("should compute decoratorName correctly", () => {
      const createScopeDecorator = createDecoratorScope("scope");

      const test = createScopeDecorator("test", () => ({
        onInit: (context) => {
          expect(context.decoratorName).toBe("@scope/test");
        },
      }));

      @test()
      class Test {
      }

      expect(Test).toBeDefined();
    });

    it("should correctly apply scope name", () => {
      const onInitSpy = vi.fn(() => {
        throw new Error("TestError");
      });

      const createScopeDecorator = createDecoratorScope("scope");

      const test = createScopeDecorator("test", () => ({
        onInit: onInitSpy,
      }));

      expect(() => {
        @test()
        class Test {
        }
      }).toThrowError('Init failed for decorator "@scope/test" at "Test": TestError');
    });
  });
});
