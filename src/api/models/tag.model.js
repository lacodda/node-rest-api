const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

const { Schema, Types } = mongoose;

/**
 * Tag Schema
 * @private
 */
const tagSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
      maxlength: 256,
      index: true,
      trim: true,
    },
    color: {
      type: String,
      maxlength: 15,
      default: 'gray',
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
tagSchema.method({
  async transform() {
    const transformed = {};
    const fields = ['id', 'name', 'color', 'createdAt', 'updatedAt'];

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
tagSchema.statics = {
  /**
   * Save all tags
   *
   * @param {Array} tagsArray - array of tags
   * @param {String} userId - The User Id.
   * @returns {Promise<Array[TagId], APIError>}
   */
  async saveAll(tagsArray, userId) {
    try {
      return Promise.all(
        tagsArray.map(async name => {
          const query = { name };
          const update = { name, userId };
          const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          };

          // Find the document
          const savedTag = await this.findOneAndUpdate(query, update, options);

          return savedTag._id;
        }),
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get tag by id and userId
   *
   * @param {ObjectId} id       The objectId of Tag
   * @param {ObjectId} userId   The objectId of User
   * @returns {Promise<Tag>}
   */
  async getOne(id, userId) {
    try {
      let tag;

      if (Types.ObjectId.isValid(id)) {
        tag = await this.findOne({ _id: id, userId }).exec();
      }
      if (tag) {
        return tag;
      }

      throw new APIError({
        message: 'Tag does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List tags in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip     Number of tags to be skipped.
   * @param {number} limit    Limit number of tags to be returned.
   * @returns {Promise<Tag[]>}
   */
  list({ page = 1, perPage = 5, userId, name, color }) {
    const options = omitBy({ userId, name, color }, isNil);
    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef tag
 */
module.exports = mongoose.model('Tag', tagSchema);
