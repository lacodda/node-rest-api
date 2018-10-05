const httpStatus = require('http-status');
const { omit } = require('lodash');
const Note = require('../models/note.model');
const Tag = require('../models/tag.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load note and append to req.
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.load = async (req, res, next) => {
  try {
    // const note = await Note.get(req.params.id);
    const note = await Note.getOne(req.params.id, req.user._id);
    req.locals = { note };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get note
 *
 * @public
 *
 * @param {*} req
 * @param {*} res
 */
exports.get = async (req, res) => res.json(await req.locals.note.transform());

/**
 * Create new note
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.create = async (req, res, next) => {
  try {
    if (req.body.tags) {
      req.body.tags = await Tag.saveAll(req.body.tags, req.user._id);
    }

    const note = new Note(req.body);
    note.userId = req.user._id;
    const savedNote = await note.save();
    res.status(httpStatus.CREATED);
    res.json(await savedNote.transform());
  } catch (error) {
    next(error);
    // next(Note.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing note
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.replace = async (req, res, next) => {
  try {
    const { note } = req.locals;

    const newNote = new Note(req.body);
    newNote.userId = req.user._id;
    const newNoteObject = omit(newNote.toObject(), '_id');

    await note.update(newNoteObject, { override: true, upsert: true });
    const savedNote = await Note.findById(note._id);
    res.json(await savedNote.transform());
  } catch (error) {
    next(error);
    // next(Note.checkDuplicateEmail(error));
  }
};

/**
 * Update existing note
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.update = async (req, res, next) => {
  try {
    const { note } = req.locals;

    note.setFromObject(req.body);
    const updatedNote = await note.save();

    res.json(await updatedNote.transform());
  } catch (error) {
    next(error);
    // next(Note.checkDuplicateEmail(error));
  }
};

/**
 * Get note list
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.list = async (req, res, next) => {
  try {
    const query = { ...req.query, userId: req.user._id };
    const notes = await Note.list(query);
    const transformedNotes = Promise.all(notes.map(note => note.transform()));
    res.json(await transformedNotes);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete note
 * @public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.remove = (req, res, next) => {
  const { note } = req.locals;

  note
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
