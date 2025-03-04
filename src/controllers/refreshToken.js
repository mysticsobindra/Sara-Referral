
const RefreshToken = require("../models/refreshToken");
const { verifyToken, generateToken } = require("../services/Token");


/**
 * Refreshes the access token using the provided refresh token.
 *
 * @async
 * @function refreshToken
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.cookie - The cookies from the request headers.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 *
 * @throws {Error} If no refresh token is provided.
 * @throws {Error} If the refresh token is invalid.
 *
 * @description
 * This function extracts the refresh token from the request cookies, verifies its validity,
 * and generates new access and refresh tokens. The new tokens are then set as cookies in the response.
 */

async function refreshToken(req, res) {
  // Extract the refresh token from the request
  const old_Refresh_Token = req.headers.cookie.split(";")[1].split("=")[1];

  // Check if the refresh token is provided
  if (!old_Refresh_Token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  // Check if the refresh token is valid
  const existing_Token = await RefreshToken.findOne({
    refreshToken: old_Refresh_Token,
  }).populate("userId");

  // Check if the refresh token is valid
  if (!existing_Token) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  // Verify the old refresh token
  verifyToken(
    old_Refresh_Token,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        // If the refresh token is invalid, return an error
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Extract the user data from the token
      const user_Data = user._doc ? user._doc : user;

      // Remove the exp and iat properties from the user data
      const { exp, iat, ...clean_User_Data } = user_Data;

      // Generate a new access token
      const new_Access_Token = await generateToken(
        { ...clean_User_Data },
        process.env.ACCESS_TOKEN_SECRET,
        "1min"
      );
      // Generate a new refresh token
      const new_Refresh_Token = await generateToken(
        { ...clean_User_Data },
        process.env.REFRESH_TOKEN_SECRET,
        "7d"
      );

      // Update the refresh token in the database
      await RefreshToken.findOneAndUpdate(
        { refreshToken: old_Refresh_Token },
        { refreshToken: new_Refresh_Token }
      );

      // Set the new access and refresh tokens as cookies
      res.cookie("ACCESS_TOKEN", new_Access_Token, {
        httpOnly: true,
        maxAge: 30 * 60 * 60 * 1000,
      });
      res.cookie("REFRESH_TOKEN", new_Refresh_Token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Access token refreshed successfully" });
    }
  );
}

module.exports = { refreshToken };
