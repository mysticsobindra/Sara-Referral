const jwt = require("jsonwebtoken");
const { verifyToken } = require("../services/Token");

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
      axios
        .post("/refreshToken")
        .then((response) => {

          const newToken = response.data.token;
          return res.status(200).json({ message: "Token refreshed" });

        })
        .catch((error) => {
          return res
            .status(403)
            .json({ message: "Access Denied Due To Expired Or Invalid Token" });
        });
    }

    req.user = verified._doc ? verified._doc : verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "failed to verify token" });
  }
};

module.exports = { authenticateToken };
