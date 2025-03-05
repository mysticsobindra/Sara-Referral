class Custom_error extends Error {
  constructor(message, status_code) {
    super(message);
    this.status_code = status_code;
    this.status = status_code >= 400 && status_code < 500 ? "fail" : "error";
    this.error = Error
    this.is_operational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}


module.exports = Custom_error;