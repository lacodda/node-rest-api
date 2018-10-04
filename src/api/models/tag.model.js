const mongoose = require('mongoose');

const { Schema } = mongoose;

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
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Statics
 */
tagSchema.statics = {
  /**
   * Save all tags
   *
   * @param {Array} tagsArray - array of tags
   * @param {string} userId - The User Id.
   * @returns {Promise<Array[TagId], APIError>}
   */
  async saveAll(tagsArray, userId) {
    try {
      return Promise.all(
        tagsArray.map(async name => {
          const tag = new this({ name, userId });
          const savedTag = await tag.save();

          return savedTag._id;
        }),
      );
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef tag
 */
module.exports = mongoose.model('tag', tagSchema);
