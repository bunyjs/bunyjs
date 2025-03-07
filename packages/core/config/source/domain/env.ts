import { config } from "dotenv-flow";
import { output, ZodSchema } from "zod";

import { $Config } from "./config";


export const $Env = <Schema extends ZodSchema>(schema: Schema) => {
  config();

  return class Env extends $Config<output<Schema>> {
    constructor(env: unknown = process.env) {
      super(schema.parse(env));
    }
  };
};
