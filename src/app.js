// 🔹 Third-Party Module Imports (npm packages)
const express = require("express");
const cors = require("cors");
const swagger_ui = require("swagger-ui-express");
const swagger_js_doc = require("swagger-jsdoc");
const cookieParser = require('cookie-parser')
require("dotenv").config();

// 🔹 Internal Module Imports
const { connect_db } = require("./connectDb");
const { authenticate_token } = require("./middlewares/authentication");
const login_signup = require("./routes/LoginSignup");
const referral_routes = require("./routes/referral");
const cms_routes = require("./routes/settings");
const game_routes = require("./routes/gameAndEarning");
const custom_error = require("./utils/customError");
const { global_error_handler } = require("./controllers/error_handler");

const app = express();
const port = process.env.PORT || 4000;
const mongoose_uri = process.env.MONGODB_URI;

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

// middleware
app.use(cors(cors_Options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// routes
app.use("/api-docs", swagger_ui.serve, swagger_ui.setup(swagger_Spec));
app.use("/", login_signup);
app.use("/referral", authenticate_token, referral_routes);
app.use("/cms", authenticate_token, cms_routes);
app.use("/game", authenticate_token, game_routes);

//route error handler middleware
app.all("*", (req, res, next) => {
  const error = new custom_error(
    `Can't find ${req.originalUrl} on this server!`
  );
  error.status_code = 404;
  next(error);
});

//global error handling middleware
app.use(global_error_handler);

//connection to database
connect_db(mongoose_uri);

//unhandled promise rejection listener
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  process.exit(1);
});

//uncaught expression listener
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
