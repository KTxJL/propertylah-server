const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const User = require("../models/userModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (data) => {
  const hashedPwd = await bcrypt.hash(data.password, 10);

  const newUser = await User.create({
    email: data.email,
    password: hashedPwd,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
  });

  if (!newUser) throw new Error("Error creating new user");

  return newUser;
};

exports.login = async (email, password) => {
  const foundUser = await User.findOne({ where: { email } });

  if (foundUser) {
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      foundUser.dataValues.token = signToken(foundUser.id);
      delete foundUser.dataValues.password;
      return foundUser;
    }
  }

  throw new Error("Invalid user or password");
};
exports.logout = async () => {};

exports.protect = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const userStillExists = await User.findByPk(decoded.id);

  if (!userStillExists)
    throw new Error("The user holding this token no longer exists");

  req.user = userStillExists;

  return true;
};