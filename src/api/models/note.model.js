const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

const { Schema, Types } = mongoose;
/**
 * Note Roles
 */
const type = ['note', 'link'];

/**
 * Note Schema
 * @private
 */
const noteSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    name: {
      type: String,
      maxlength: 256,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: type,
      default: 'note',
    },
    content: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Methods
 */
noteSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'type', 'content', 'createdAt'];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  setFromObject(object) {
    Object.assign(this, object);
  },
});

/**
 * Statics
 */
noteSchema.statics = {
  type,

  /**
   * Get note
   *
   * @param {ObjectId} id - The objectId of note.
   * @returns {Promise<Note, APIError>}
   */
  async get(id) {
    try {
      let note;

      if (Types.ObjectId.isValid(id)) {
        note = await this.findById(id).exec();
      }
      if (note) {
        return note;
      }

      throw new APIError({
        message: 'Note does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List notes in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of notes to be skipped.
   * @param {number} limit - Limit number of notes to be returned.
   * @returns {Promise<Note[]>}
   */
  list({ page = 1, perPage = 5, userId }) {
    const options = omitBy({ userId }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Note
 */
module.exports = mongoose.model('note', noteSchema);
