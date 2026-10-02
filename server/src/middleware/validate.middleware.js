const ApiResponse = require('../utils/response');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    return next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.slice(1).join('.'),
        message: e.message
      }));
      return ApiResponse.error(res, 'Validasi data gagal', formattedErrors, 422);
    }
    return next(err);
  }
};

module.exports = validate;
