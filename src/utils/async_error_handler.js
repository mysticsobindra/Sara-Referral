const async_error_handler = (fn) => {
  return(req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};


module.exports = { async_error_handler };