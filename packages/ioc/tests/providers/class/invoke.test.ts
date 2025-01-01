import { it, expect, describe, beforeEach } from "vitest";

import { use, invoke, container } from "~/main";

describe("Invoke", () => {
  beforeEach(async () => {
  });

  it("should invoke method", async () => {
    class User1 {
      id = "1";
    }

    class User2 {
      id = "2";
    }

    class Service {
      getUsers(user1: User1, @use() user2: User2) {
        return [user1.id, user2.id];
      }
    }

    await container.register({
      token: User1,
      useClass: User1,
    });

    await container.register({
      token: User2,
      useClass: User2,
    });

    await container.register({
      token: Service,
      useClass: Service,
    });

    const service = await container.resolve(Service);

    const id = await invoke({
      target: service,
      method: service.getUsers,
      scope: container,
    });

    expect(id).toEqual(["1", "2"]);
  });
});
