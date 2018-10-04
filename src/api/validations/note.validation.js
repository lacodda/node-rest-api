const Joi = require('joi');
const Note = require('../models/note.model');

module.exports = {
  // GET /v1/notes
  listNotes: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      name: Joi.string(),
      content: Joi.string(),
      type: Joi.string().valid(Note.type),
    },
  },

  // POST /v1/notes
  createNote: {
    body: {
      content: Joi.string().required(),
      name: Joi.string().max(256),
      type: Joi.string().valid(Note.type),
      tags: Joi.array().items(Joi.string()),
    },
  },

  // PUT /v1/notes/:id
  replaceNote: {
    body: {
      content: Joi.string().required(),
      name: Joi.string().max(256),
      type: Joi.string().valid(Note.type),
    },
    params: {
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },

  // PATCH /v1/notes/:id
  updateNote: {
    body: {
      content: Joi.string(),
      name: Joi.string().max(256),
      type: Joi.string().valid(Note.type),
    },
    params: {
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
