const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  jwt.verify(req.headers.authorization, "secret", (err) => {
    if (err) {
      return res.send(401);
    }
    next();
  });
};

module.exports = { verifyToken };
