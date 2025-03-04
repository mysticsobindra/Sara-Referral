const jwt = require("jsonwebtoken");
const { verifyToken } = require("../services/Token");

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
 *                     or calls the next middleware function if the token is valid.
 */

const authenticateToken = (req, res, next) => {

  if (!req.headers.cookie) {
    return res.status(401).json({ message: "cookie is missing" });
  }

  const Access_Token = req.headers.cookie.split(";")[0].split("=")[1];

  if (!Access_Token) {
    return res.status(401).json({ message: "access token is missing" });
  }

  try {
    const verified = verifyToken(Access_Token, process.env.ACCESS_TOKEN_SECRET);

    if (!verified) {
      return res.status(403).json({ message: "access token is invalid" });
    }

    req.user = verified._doc ? verified._doc : verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "failed to verify token" });
  }
  
};

module.exports = { authenticateToken };
