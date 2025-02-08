import { $App, start } from "@bunyjs/app";
import { $Queue, $Worker } from "@bunyjs/bull";
import { use, usable } from "@bunyjs/ioc";
import { $Redis } from "@bunyjs/redis";

@usable()
class Redis extends $Redis {
  constructor() {
    super({
      lazyConnect: true,
      maxRetriesPerRequest: null,
      host: "localhost",
      port: 6379,
    });
  }
}

@usable()
class Queue extends $Queue {
  constructor(@use() redis: Redis) {
    super("myqueue", {
      connection: redis,
    });
  }
}

@usable()
class Worker extends $Worker {
  constructor(@use() queue: Queue, @use() redis: Redis) {
    super(queue.name, async (job) => {
      console.log(job.data);
    }, {
      connection: redis,
    });
  }
}

@usable()
class App extends $App {
  @use()
  redis: Redis;

  @use()
  queue: Queue;

  @use()
  worker: Worker;

  @start()
  async start() {
    await this.queue.add("myjob", {
      data: "Hello World",
    });
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
