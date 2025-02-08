import { DecoratorType } from "@bunyjs/ioc";

import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";

import { createTypeormDecorator } from "~/shared/scope";

export class $DataSource extends DataSource {
  static get repo() {
    return createTypeormDecorator("repo", <Entity extends ObjectLiteral>(entity: EntityTarget<Entity>) => ({
      apply: [
        DecoratorType.Property,
        DecoratorType.Parameter,
      ],
      onInit: {
        [DecoratorType.Property]: (context) => {
          context.addProperty({
            propertyKey: context.propertyKey,
            handler: async ({ container }) => {
              const datasource = await container.resolve(this);
              return datasource.getRepository(entity);
            },
          });
        },
      },
    }));
  }
}
