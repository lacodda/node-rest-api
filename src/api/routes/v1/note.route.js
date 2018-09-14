const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/note.controller');
const { authorize, ADMIN, LOGGED_USER, LOGGED } = require('../../middlewares/auth');
// const {
//   listNotes,
//   createNote,
//   replaceNote,
//   updateNote,
// } = require('../../validations/note.validation');

const router = express.Router();

/**
 * Load note when API with noteId route parameter is hit
 */
// router.param('noteId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/notes List Notes
   * @apiDescription Get a list of notes
   * @apiVersion 1.0.0
   * @apiName ListNotes
   * @apiGroup Note
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Note's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Notes per page
   * @apiParam  {String}             [name]       Note's name
   * @apiParam  {String}             [email]      Note's email
   * @apiParam  {String=note,admin}  [role]       Note's role
   *
   * @apiSuccess {Object[]} notes List of notes.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated notes can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  // .get(authorize(ADMIN), validate(listNotes), controller.list); TODO: validation
  .get(authorize(LOGGED), controller.list)
  /**
   * @api {post} v1/notes Create Note
   * @apiDescription Create a new note
   * @apiVersion 1.0.0
   * @apiName CreateNote
   * @apiGroup Note
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Note's access token
   *
   * @apiParam  {String}             email     Note's email
   * @apiParam  {String{6..128}}     password  Note's password
   * @apiParam  {String{..128}}      [name]    Note's name
   * @apiParam  {String=note,admin}  [role]    Note's role
   *
   * @apiSuccess (Created 201) {String}  id         Note's id
   * @apiSuccess (Created 201) {String}  name       Note's name
   * @apiSuccess (Created 201) {String}  email      Note's email
   * @apiSuccess (Created 201) {String}  role       Note's role
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated notes can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  // .post(authorize(ADMIN), validate(createNote), controller.create); TODO: validation
  .post((authorize(LOGGED)), controller.create);

module.exports = router;
