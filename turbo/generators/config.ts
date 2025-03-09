import { PlopTypes } from "@turbo/gen";

enum PackageType {
  Bots = "bots",
  Core = "core",
  Cache = "cache",
  Database = "database",
  Messaging = "messaging",
  Queue = "queue",
  Scheduler = "scheduler",
  Storage = "storage",
  Web = "web",
}

const generator = (plop: PlopTypes.NodePlopAPI) => {
  plop.setGenerator("generate-package", {
    description: "Generate a new bunyjs package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Package name",
      },
      {
        type: "list",
        name: "type",
        message: "Package type",
        choices: Object.values(PackageType),
      },
    ],
    actions: (data: any) => {
      data.Name = plop.getHelper("pascalCase")(data.name);

      return [
        {
          type: "addMany",
          destination: "examples/{{type}}/{{name}}",
          base: "templates/example",
          templateFiles: "templates/example/**/*",
        },
        {
          type: "addMany",
          destination: "packages/{{type}}/{{name}}",
          base: "templates/package",
          templateFiles: "templates/package/**/*",
        },
      ];
    },
  });
};

export default generator;
