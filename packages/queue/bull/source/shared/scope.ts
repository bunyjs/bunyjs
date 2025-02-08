import { createMetadataScope, createDecoratorScope } from "@bunyjs/ioc";
 
export const createBullMetadata = createMetadataScope("bull");
export const createBullDecorator = createDecoratorScope("bull");
