const { ApolloServer } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} = require("apollo-server-core");
const { typeDefs } = require("./schemas/schema");
const { resolvers } = require("./resolvers/resolvers");
const { getToken } = require("./helpers/getToken");

require("dotenv").config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
  context: ({ req }) => {
    const headerToken = req.get("Authorization") || "";
    return { token: getToken(headerToken.replace("Bearer", "")) };
  },
  playground: true,
  introspection: true,
});

server
  .listen({ port: 5005 })
  .then(({ url }) => console.log(`🚀 Server ready at ${url}`));
