const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

/**
 * Tag Types
 */
const type = ['tag', 'link'];

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
 * @typedef tag
 */
module.exports = mongoose.model('tag', tagSchema);
