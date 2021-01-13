import { ApolloServer } from "apollo-server-micro";
import { schema } from "../../graphql/schema";

const apolloServer = new ApolloServer({ schema: schema, playground: false });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
