const Joi = require("joi");

const enrollmentValidationSchema = Joi.object({
  lrn: Joi.string().required(),
  schoolYear: Joi.string().required(),
  grade: Joi.string().required(),
  section: Joi.string().required(),
});
module.exports = enrollmentValidationSchema;
