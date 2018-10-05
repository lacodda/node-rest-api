const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/tag.controller');
const { authorize, LOGGED } = require('../../middlewares/auth');
const {
  listTags,
  createTag,
  replaceTag,
  updateTag,
} = require('../../validations/tag.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/tags List Tags
   * @apiDescription Get a list of tags
   * @apiVersion 1.0.0
   * @apiName ListTags
   * @apiGroup Tag
   * @apiPermission logged user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Tags per page
   * @apiParam  {String}             [name]       Tag's name
   * @apiParam  {String}             [color]      Tag's color
   *
   * @apiSuccess {Object[]} tags List of tags.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only data owner or admins can access the data
   */
  .get(authorize(LOGGED), validate(listTags), controller.list)
  /**
   * @api {post} v1/tags Create Tag
   * @apiDescription Create a new tag
   * @apiVersion 1.0.0
   * @apiName CreateTag
   * @apiGroup Tag
   * @apiPermission logged user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..256}}      name       Tag's name
   * @apiParam  {String{..15}}       [color]    Tag's color
   *
   * @apiSuccess (Created 201) {String}  id         Tag's id
   * @apiSuccess (Created 201) {String}  name       Tag's name
   * @apiSuccess (Created 201) {String}  color      Tag's color
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   * @apiSuccess (Created 201) {Date}    updatedAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only logged user can create the data
   */
  .post(authorize(LOGGED), validate(createTag), controller.create);

router
  .route('/:id')
  /**
   * @api {get} v1/tags/:id Get Tag
   * @apiDescription Get tag information
   * @apiVersion 1.0.0
   * @apiName GetTag
   * @apiGroup Tag
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess {String}  id         Tag's id
   * @apiSuccess {String}  name       Tag's name
   * @apiSuccess {String}  color      Tag's color
   * @apiSuccess {Date}    createdAt  Timestamp
   * @apiSuccess {Date}    updatedAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only data owner or admins can access the data
   * @apiError (Not Found 404)    NotFound     Tag does not exist
   */
  .get(authorize(LOGGED), controller.load, controller.get)
  /**
   * @api {put} v1/tags/:id Replace Tag
   * @apiDescription Replace the whole tag document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceTag
   * @apiGroup Tag
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..256}}      name       Tag's name
   * @apiParam  {String{..15}}       [color]    Tag's color
   *
   * @apiSuccess {String}  id         Tag's id
   * @apiSuccess {String}  name       Tag's name
   * @apiSuccess {String}  color      Tag's color
   * @apiSuccess {Date}    createdAt  Timestamp
   * @apiSuccess {Date}    updatedAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden        Only data owner or admins can modify the data
   * @apiError (Not Found 404)    NotFound         Tag does not exist
   */
  .put(
    authorize(LOGGED),
    validate(replaceTag),
    controller.load,
    controller.replace,
  )
  /**
   * @api {patch} v1/tags/:id Update Tag
   * @apiDescription Update some fields of a tag document
   * @apiVersion 1.0.0
   * @apiName UpdateTag
   * @apiGroup Tag
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..256}}      name       Tag's name
   * @apiParam  {String{..15}}       [color]    Tag's color
   *
   * @apiSuccess {String}  id         Tag's id
   * @apiSuccess {String}  name       Tag's name
   * @apiSuccess {String}  color      Tag's color
   * @apiSuccess {Date}    createdAt  Timestamp
   * @apiSuccess {Date}    updatedAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized     Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden        Only data owner or admins can modify the data
   * @apiError (Not Found 404)    NotFound         Tag does not exist
   */
  .patch(
    authorize(LOGGED),
    validate(updateTag),
    controller.load,
    controller.update,
  )
  /**
   * @api {delete} v1/tags/:id Delete Tag
   * @apiDescription Delete a tag
   * @apiVersion 1.0.0
   * @apiName DeleteTag
   * @apiGroup Tag
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only data owner or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Tag does not exist
   */
  .delete(authorize(LOGGED), controller.load, controller.remove);

module.exports = router;
