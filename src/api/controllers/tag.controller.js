const httpStatus = require('http-status');
const { omit } = require('lodash');
const Tag = require('../models/tag.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load tag and append to req.
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.load = async (req, res, next) => {
  try {
    const tag = await Tag.getOne(req.params.id, req.user._id);
    req.locals = { tag };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get tag
 *
 * @public
 *
 * @param {*} req
 * @param {*} res
 */
exports.get = async (req, res) => res.json(await req.locals.tag.transform());

/**
 * Create new tag
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.create = async (req, res, next) => {
  try {
    // TODO: combine to general method with Tag.saveAll()
    const tag = new Tag(req.body);
    const { name, color, isDeleted } = tag;
    const userId = req.user._id;

    const query = { name, userId };
    const update = { name, color, isDeleted, userId };
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    // Find the document
    const savedTag = await Tag.findOneAndUpdate(query, update, options);

    res.status(httpStatus.CREATED);
    res.json(await savedTag.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Replace existing tag
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.replace = async (req, res, next) => {
  try {
    const { tag } = req.locals;

    const newTag = new Tag(req.body);
    newTag.userId = req.user._id;
    const newTagObject = omit(newTag.toObject(), '_id');

    await tag.update(newTagObject, { override: true, upsert: true });
    const savedTag = await Tag.findById(tag._id);
    res.json(await savedTag.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing tag
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.update = async (req, res, next) => {
  try {
    const { tag } = req.locals;

    tag.setFromObject(req.body);
    const updatedTag = await tag.save();

    res.json(await updatedTag.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get tag list
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.list = async (req, res, next) => {
  try {
    const query = { ...req.query, userId: req.user._id };
    const tags = await Tag.list(query);
    const transformedTags = Promise.all(tags.map(tag => tag.transform()));
    res.json(await transformedTags);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete tag
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.remove = (req, res, next) => {
  const { tag } = req.locals;

  tag
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
