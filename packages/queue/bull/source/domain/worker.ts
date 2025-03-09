import { Worker } from "bullmq";

export abstract class $Worker<DataType = any, ResultType = any, NameType extends string = string> extends Worker<DataType, ResultType, NameType> {
}
