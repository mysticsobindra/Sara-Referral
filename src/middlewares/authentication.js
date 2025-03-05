// 🔹 Third-Party Module Imports (npm packages)
const jwt = require("jsonwebtoken");

// 🔹 Internal Module Imports (Project files)
const { verify_token } = require("../services/Token");
const Custom_error = require("../utils/customError");
const user_model = require("../models/User");

/**
 * Middleware to authenticate the access token from the request cookies.
 *
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} - Returns a response with status 401 if the cookie or access token is missing,
 *                     status 403 if the token is expired or invalid,
 *                     status 400 if token verification fails,
 *                     status 404 if the user is not found,
 *                     or calls the next middleware function if the token is valid.
 */

const authenticate_token = async (req, res, next) => {
  if (!req.cookies) {
    const error = new Custom_error("No cookies found", 404);
    return next(error);
  }

  const Access_Token = req.cookies.access_token;

  if (!Access_Token) {
    return res.status(401).json({ message: "access token is missing" });
  }

  const verified = verify_token(Access_Token, process.env.ACCESS_TOKEN_SECRET);

  if (!verified) {
    return res.status(403).json({ message: "access token is invalid" });
  }

  const user_data = verified._doc ? verified._doc : verified;
  const { exp, iat, ...clean_User_Data } = user_data;

  const user = await user_model.findById(clean_User_Data._id);

  if (!user) {
    const error = new Custom_error("User not found", 404);
    return next(error);
  }

  req.user = user;
  return next();
};

module.exports = { authenticate_token };
