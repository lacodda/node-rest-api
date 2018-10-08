const Joi = require('joi');

module.exports = {
  // GET /v1/tags
  listTags: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      name: Joi.string(),
      color: Joi.string(),
    },
  },

  // POST /v1/tags
  createTag: {
    body: {
      name: Joi.string()
        .max(256)
        .required(),
      color: Joi.string().max(15),
    },
  },

  // PUT /v1/tags/:id
  replaceTag: {
    body: {
      name: Joi.string()
        .max(256)
        .required(),
      color: Joi.string().max(15),
    },
    params: {
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },

  // PATCH /v1/tags/:id
  updateTag: {
    body: {
      name: Joi.string().max(256),
      color: Joi.string().max(15),
    },
    params: {
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
