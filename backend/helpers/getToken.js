const jwt = require("jsonwebtoken");

const getToken = (token) => {
  try {
    return token ? jwt.verify(token, process.env.JWT_SECRET) : null;
  } catch (error) {
    return null;
  }
};

module.exports = { getToken };
