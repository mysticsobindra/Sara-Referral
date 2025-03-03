const jwt = require("jsonwebtoken");

// Function to generate an access token
 function generateToken(payload, Token_Secret, expires = "1h") {
return jwt.sign(payload, Token_Secret, { expiresIn: expires });

}

// Function to verify an access token
function verifyToken(token, Token_Secret , callbackFunction = null) {
  try {
    return jwt.verify(token, Token_Secret , callbackFunction);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
