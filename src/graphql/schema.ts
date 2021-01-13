import { makeSchema } from "@nexus/schema";
import path from "path";
import * as typeDefs from "./typeDefs";

export const schema = makeSchema({
  types: typeDefs,
  nonNullDefaults: {
    output: true,
    input: true,
  },
  outputs: {
    schema: path.resolve(
      process.cwd(),
      "src/graphql/generated/apiSchema.graphql",
    ),
    typegen: path.resolve(
      process.cwd(),
      "src/graphql/generated/apiSchemaTypings.ts",
    ),
  },
  shouldGenerateArtifacts: process.env.NODE_ENV === "development",
  prettierConfig: {
    trailingComma: "all",
    singleQuote: true,
  },
});
