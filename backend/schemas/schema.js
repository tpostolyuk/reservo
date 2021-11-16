const { gql } = require("apollo-server");

const typeDefs = gql`
  type Service {
    id: String!
    name: String!
    location: String!
  }
  type User {
    login: String!
    password: String!
    city: String!
    email: String!
  }
  type AuthPayload {
    login: String!
    email: String!
    token: String!
  }
  type Query {
    service(id: Int!): Service
    services: [Service!]!
    me(login: String!): User
  }
  type Mutation {
    addService(name: String!, location: String!): Service!
    removeService(id: String!): String!
    updateService(id: String!, name: String!, location: String!): String!
    signUp(
      login: String!
      password: String!
      email: String!
      city: String!
    ): AuthPayload!
    signIn(login: String!, password: String!): AuthPayload!
  }
`;

module.exports = { typeDefs };
