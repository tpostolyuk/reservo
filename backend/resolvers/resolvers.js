const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../helpers/pgAdaptor");

const resolvers = {
  Query: {
    async services(_, args, { token }) {
      if (!token) {
        throw new Error("You are not authenticated!");
      }
      return await db.manyOrNone("SELECT * FROM services");
    },
    async service(_, { id }, { token }) {
      if (!token) {
        throw new Error("You are not authenticated!");
      }
      return await db.one("SELECT * FROM services WHERE id = $1", id);
    },
    async me(_, { login }, { token }) {
      if (!token) {
        throw new Error("You are not authenticated!");
      }
      return await db.one("SELECT * FROM users WHERE login = $1", login);
    },
  },
  Mutation: {
    addService: async (_, { id, name, location }) => {
      const values = [id, name, location];
      try {
        return await db.one(
          `INSERT INTO services(id, name, location) VALUES($1, $2, $3) RETURNING id, name, location`,
          values
        );
      } catch (err) {
        console.log(err);
      }
    },
    removeService: async (_, { id }) => {
      try {
        return await db.one(
          "DELETE FROM services WHERE id = $1 RETURNING id, name, location",
          id
        );
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateService: async (_, { id, name, location }) => {
      try {
        const previousService = await db.one(
          "SELECT * FROM services WHERE id = $1",
          id
        );
        const values = [
          id,
          name || previousService.name,
          location || previousService.location,
        ];
        await db.one(
          "UPDATE services SET name = $2, location = $3 WHERE id = $1",
          values
        );
        return "Service was successfully updated";
      } catch (err) {
        console.log("Error: ", err);
      }
    },
    signUp: async (_, { login, password, email, city }) => {
      try {
        const sameUserLogin = await db.one(
          "SELECT * FROM users WHERE login = $1",
          login
        );
        if (!sameUserLogin) {
          console.log(login, password, city, email);
          const hashedPassword = await bcrypt.hash(password, 10);
          const values = [login, hashedPassword, email, city];
          const token = jwt.sign({ login, email }, process.env.JWT_SECRET, {
            expiresIn: "1y",
          });
          await db.one(
            "INSERT INTO users (login, password, email, city) VALUES($1, $2, $3, $4) RETURNING $1, $3, $4",
            values
          );
          return {
            login,
            email,
            token,
            message: "Signed up successfully",
          };
        } else {
          throw new Error("User already exists");
        }
      } catch (err) {
        throw new Error(err.message);
      }
    },
    signIn: async (_, { login, password }) => {
      try {
        const user = await db.one(
          "SELECT * FROM users WHERE login = $1",
          login
        );
        if (!user) {
          throw new Error("No user with this email");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        return {
          token,
          login,
          email: user.email,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

module.exports = { resolvers };
