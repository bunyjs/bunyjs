import { $App, init, start, shutdown, bootstrap } from "@bunyjs/app";
import { usable } from "@bunyjs/ioc";
import { $DataSource } from "@bunyjs/typeorm";

import { Column, Entity, Repository, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;
}

@usable()
class DataSource extends $DataSource {
  constructor() {
    super({
      type: "sqlite",
      database: ":memory:",
      entities: [User],
      synchronize: true,
    });
  }

  @bootstrap()
  async bootstrap() {
    await this.initialize();
    console.log("Database initialized");
  }

  @shutdown()
  async shutdown() {
    await this.destroy();
    console.log("Database closed");
  }
}

@usable()
class App extends $App {
  @DataSource.repo(User)
  userRepo: Repository<User>;

  @init()
  async init() {
    const user = new User();
    user.firstName = "John";
    user.lastName = "Doe";
    user.age = 30;
    await this.userRepo.save(user);
    console.log("User saved");
  }

  @start()
  async start() {
    const users = await this.userRepo.find();
    console.log(users);
  }
}

process.on("beforeExit", async () => {
  await App.shutdown();
});

await App.bootstrap();
