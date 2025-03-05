// 🔹 Third-Party Module Imports (npm packages)
const jwt = require("jsonwebtoken");

// Function to generate an access token
 function generate_token(payload, token_secret, expires = "1h") {
return jwt.sign(payload, token_secret, { expiresIn: expires });

}

// Function to verify an access token
function verify_token(token, token_secret , callback_function = null) {
  try {
    return jwt.verify(token, token_secret , callback_function);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generate_token,
  verify_token,
};
