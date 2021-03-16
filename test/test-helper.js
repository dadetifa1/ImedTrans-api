const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ userid: user.userid }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

function hashValue(value) {
  const hashedValue = bcrypt.hashSync(user.password, 1);

  return hashedValue;
}

module.exports = {
  makeAuthHeader,
};
