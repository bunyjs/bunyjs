import { createMetadataScope, createDecoratorScope } from "@bunyjs/ioc";

export const createDiscordDecorator = createDecoratorScope("discord");
export const createDiscordMetadata = createMetadataScope("discord");
