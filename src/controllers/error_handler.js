const Custom_error = require("../utils/customError");

const development_error = (res, error) => {
  return res.status(error.status_code).json({
    status: error.status_code,
    message: error.message,
    error_trace: error.stack,
    error: error,
  });
};

const production_error = (res, error) => {
  if (!!error.is_operational) {
    return res.status(error.status_code).json({
      status: error.status_code,
      errorStatus: error.status,
      message: error.message,
    });
  }

  return res.status(error.status_code).json({
    status: "error",
    message: "something went wrong",
  });
};

const validation_error_handler = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new Custom_error(message, 400);
};

const duplicate_error_handler = (err) => {
  const message = ` ${err.keyValue.email} already exists`;
  return new Custom_error(message, 409);
};

const cast_error_handler = (err) => {
  const message = `Invalid ${err.path}: ${err.value._id}`;
  return new Custom_error(message, 400);
};

const global_error_handler = (error, req, res, next) => {
  error.status_code = error.status_code || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    return development_error(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.code === 11000) {
      error = duplicate_error_handler(error);
    }
    if (error.name === "CastError") {
      error = cast_error_handler(error);
    }
    if (error.name === "ValidationError") {
      error = validation_error_handler(error);
    }

    return production_error(res, error);
  }
};


module.exports = { global_error_handler };
