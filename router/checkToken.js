const util = require("util");
const jwt = require("jsonwebtoken");
const CustomError = require("../CustomError.js");
const secretKey = process.env.secret_Key;
const asyncverify = util.promisify(jwt.verify);

const user = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return next(
      CustomError({
        statusCode: 401,
        message: "Token not exist",
      })
    );
  }

  try {
    const decoded = await asyncverify(token, secretKey);
    if (!decoded.isAdmin) {
      return next(
        CustomError({
          statusCode: 401,
          message: "Only admins can access this",
        })
      );
    }
    next();
  } catch (err) {
    return next(
      CustomError({
        statusCode: 401,
        message: "there is a problem with provided token",
      })
    );
  }
};

const admin = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return next(
      CustomError({
        statusCode: 401,
        message: "Token not exist",
      })
    );
  }

  try {
    const decoded = await asyncverify(token, secretKey);
    if (!decoded.isAdmin) {
      return next(
        CustomError({
          statusCode: 401,
          message: "Only admins can access this",
        })
      );
    }
    next();
  } catch (err) {
    return next(
      CustomError({
        statusCode: 401,
        message: "there is a problem with provided token",
      })
    );
  }
};

module.exports = { admin, user };
