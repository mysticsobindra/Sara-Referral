// 🔹 Third-Party Module Imports (npm packages)
const express = require("express");
const cors = require("cors");
const swagger_ui = require("swagger-ui-express");
const swagger_js_doc = require("swagger-jsdoc");
require("dotenv").config();

// 🔹 Internal Module Imports
const { connect_db } = require("./connectDb");
const { authenticate_token } = require("./middlewares/authentication");
const login_signup = require("./routes/LoginSignup");
const referral_routes = require("./routes/referral");
const cms_routes = require("./routes/settings");
const game_routes = require("./routes/gameAndEarning");

const app = express();
const port = process.env.PORT || 4000;

connect_db(process.env.MONGODB_URI);

const swagger_Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Customer API",
      description: "Customer API Information",
      contact: {
        name: "Amazing Developer",
      },
      servers: [`http://localhost:${port}`],
    },
  },
  apis: ["./src/routes/*.js"],
};

const cors_Options = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

const swagger_Spec = swagger_js_doc(swagger_Options);

app.use(cors(cors_Options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swagger_ui.serve, swagger_ui.setup(swagger_Spec));
app.use("/", login_signup);
app.use("/referral", authenticate_token, referral_routes);
app.use("/cms", authenticate_token, cms_routes);
app.use("/game", authenticate_token, game_routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
