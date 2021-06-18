// this function is used instead of try/catch inside async functions
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
