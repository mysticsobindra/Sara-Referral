// 🔹 Internal Module Imports (Project files)
const { verify_token, generate_token } = require("../services/Token");

/**
 * Refreshes the access token using the provided refresh token.
 *
 * @async
 * @function refresh_token
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

async function refresh_token(req, res) {
  // Extract the refresh token from the request
  const old_refresh_token = req.headers.cookie.split(";")[1].split("=")[1];

  // Check if the refresh token is provided
  if (!old_refresh_token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  // Verify the old refresh token
  verify_token(
    old_refresh_token,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        // If the refresh token is invalid, return an error
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Extract the user data from the token
      const user_data = user._doc ? user._doc : user;

      // Remove the exp and iat properties from the user data
      const { exp, iat, ...clean_User_Data } = user_data;

      // Generate a new access token
      const new_access_token = await generate_token(
        { ...clean_User_Data },
        process.env.ACCESS_TOKEN_SECRET,
        "15min"
      );
      // Generate a new refresh token
      const new_refresh_token = await generate_token(
        { ...clean_User_Data },
        process.env.REFRESH_TOKEN_SECRET,
        "7d"
      );

      // Set the new access and refresh tokens as cookies
      res.cookie("ACCESS_TOKEN", new_access_token, {
        httpOnly: true,
        maxAge: 30 * 60 * 60 * 1000,
      });
      res.cookie("REFRESH_TOKEN", new_refresh_token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Access token refreshed successfully" });
    }
  );
}

module.exports = { refresh_token };
