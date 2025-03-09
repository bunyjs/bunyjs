import { createMetadataScope, createDecoratorScope } from "@bunyjs/ioc";
 
export const createPulseMetadata = createMetadataScope("pulse");
export const createPulseDecorator = createDecoratorScope("pulse");
