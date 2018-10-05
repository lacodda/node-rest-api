const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/note.controller');
const { authorize, LOGGED } = require('../../middlewares/auth');
const {
  listNotes,
  createNote,
  replaceNote,
  updateNote,
} = require('../../validations/note.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/notes List Notes
   * @apiDescription Get a list of notes
   * @apiVersion 1.0.0
   * @apiName ListNotes
   * @apiGroup Note
   * @apiPermission logged user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Notes per page
   * @apiParam  {String}             [name]       Note's name
   * @apiParam  {String}             [content]    Note's content
   * @apiParam  {String=note,link}   [type]       Note's type
   *
   * @apiSuccess {Object[]} notes List of notes.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only data owner or admins can access the data
   */
  .get(authorize(LOGGED), validate(listNotes), controller.list)
  /**
   * @api {post} v1/notes Create Note
   * @apiDescription Create a new note
   * @apiVersion 1.0.0
   * @apiName CreateNote
   * @apiGroup Note
   * @apiPermission logged user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String}             content   Note's content
   * @apiParam  {String{..256}}      [name]    Note's name
   * @apiParam  {String=note,link}   [type]    Note's type
   * @apiParam  {String[]}           [tags]    Note's tags
   *
   * @apiSuccess (Created 201) {String}   id          Note's id
   * @apiSuccess (Created 201) {String}   name        Note's name
   * @apiSuccess (Created 201) {String}   content     Note's content
   * @apiSuccess (Created 201) {String}   type        Note's type
   * @apiSuccess (Created 201) {Object[]} tags        List of tags
   * @apiSuccess (Created 201) {Date}     createdAt   Timestamp
   * @apiSuccess (Created 201) {Date}     updatedAt   Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only logged user can create the data
   */
  .post(authorize(LOGGED), validate(createNote), controller.create);

router
  .route('/:id')
  /**
   * @api {get} v1/notes/:id Get Note
   * @apiDescription Get note information
   * @apiVersion 1.0.0
   * @apiName GetNote
   * @apiGroup Note
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess {String}   id          Note's id
   * @apiSuccess {String}   name        Note's name
   * @apiSuccess {String}   content     Note's content
   * @apiSuccess {String}   type        Note's type
   * @apiSuccess {Object[]} tags        List of tags
   * @apiSuccess {Date}     createdAt   Timestamp
   * @apiSuccess {Date}     updatedAt   Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only data owner or admins can access the data
   * @apiError (Not Found 404)    NotFound     Note does not exist
   */
  .get(authorize(LOGGED), controller.load, controller.get)
  /**
   * @api {put} v1/notes/:id Replace Note
   * @apiDescription Replace the whole note document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceNote
   * @apiGroup Note
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String}             content   Note's content
   * @apiParam  {String{..256}}      [name]    Note's name
   * @apiParam  {String=note,link}   [type]    Note's type
   * @apiParam  {String[]}           [tags]    Note's tags
   *
   * @apiSuccess {String}   id          Note's id
   * @apiSuccess {String}   name        Note's name
   * @apiSuccess {String}   content     Note's content
   * @apiSuccess {String}   type        Note's type
   * @apiSuccess {Object[]} tags        List of tags
   * @apiSuccess {Date}     createdAt   Timestamp
   * @apiSuccess {Date}     updatedAt   Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden        Only data owner or admins can modify the data
   * @apiError (Not Found 404)    NotFound         Note does not exist
   */
  .put(
    authorize(LOGGED),
    validate(replaceNote),
    controller.load,
    controller.replace,
  )
  /**
   * @api {patch} v1/notes/:id Update Note
   * @apiDescription Update some fields of a note document
   * @apiVersion 1.0.0
   * @apiName UpdateNote
   * @apiGroup Note
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String}             content   Note's content
   * @apiParam  {String{..256}}      [name]    Note's name
   * @apiParam  {String=note,link}   [type]    Note's type
   * @apiParam  {String[]}           [tags]    Note's tags
   *
   * @apiSuccess {String}   id          Note's id
   * @apiSuccess {String}   name        Note's name
   * @apiSuccess {String}   content     Note's content
   * @apiSuccess {String}   type        Note's type
   * @apiSuccess {Object[]} tags        List of tags
   * @apiSuccess {Date}     createdAt   Timestamp
   * @apiSuccess {Date}     updatedAt   Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden        Only data owner or admins can modify the data
   * @apiError (Not Found 404)    NotFound         Note does not exist
   */
  .patch(
    authorize(LOGGED),
    validate(updateNote),
    controller.load,
    controller.update,
  )
  /**
   * @api {delete} v1/notes/:id Delete Note
   * @apiDescription Delete a note
   * @apiVersion 1.0.0
   * @apiName DeleteNote
   * @apiGroup Note
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only data owner or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Note does not exist
   */
  .delete(authorize(LOGGED), controller.load, controller.remove);

module.exports = router;
