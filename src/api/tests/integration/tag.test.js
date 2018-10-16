/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil, first } = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Tag = require('../../models/tag.model');

/**
 * root level hooks
 */
async function format(tag) {
  // get tags from database
  const dbTag = (await Tag.findOne({ name: tag.name })).transform();

  // remove null and undefined properties
  return omitBy(dbTag, isNil);
}
// TODO: remove setup to separate file
// TODO: remove tag -> remove from all notes
// TODO: delete -> isDeleted

describe('Tags API', () => {
  let adminAccessToken;
  let userAccessToken;
  let dbUsers;
  let dbTags;
  let tag;

  beforeEach(async () => {
    const password = '123456';
    const passwordHashed = await bcrypt.hash(password, 1);

    dbUsers = {
      branStark: {
        email: 'branstark@gmail.com',
        password: passwordHashed,
        name: 'Bran Stark',
        role: 'admin',
      },
      jonSnow: {
        email: 'jonsnow@gmail.com',
        password: passwordHashed,
        name: 'Jon Snow',
      },
    };

    dbTags = {
      firstTag: {
        name: 'Tag 1',
        color: 'blue',
      },
      secondTag: {
        name: 'Tag 2',
        color: 'orange',
      },
    };

    tag = {
      name: 'New Tag',
    };

    await User.remove({});
    await User.insertMany([dbUsers.branStark, dbUsers.jonSnow]);

    await Tag.remove({});
    const userId = (await User.findOne({}))._id;
    await Tag.insertMany([
      { ...dbTags.firstTag, userId },
      { ...dbTags.secondTag, userId },
    ]);

    dbUsers.branStark.password = password;
    dbUsers.jonSnow.password = password;

    adminAccessToken = (await User.findAndGenerateToken(dbUsers.branStark))
      .accessToken;
    userAccessToken = (await User.findAndGenerateToken(dbUsers.jonSnow))
      .accessToken;
  });

  describe('POST /v1/tags', () => {
    it('should create a new tag when request is ok', () => {
      return request(app)
        .post('/v1/tags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(tag)
        .expect(httpStatus.CREATED)
        .then(res => {
          expect(res.body).to.include(tag);
        });
    });

    it('should create a new tag and set default color to "gray"', () => {
      return request(app)
        .post('/v1/tags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(tag)
        .expect(httpStatus.CREATED)
        .then(res => {
          expect(res.body.color).to.be.equal('gray');
        });
    });

    it('should report error when create tag without name', () => {
      delete tag.name;

      return request(app)
        .post('/v1/tags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(tag)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field, location, messages } = res.body.errors[0];
          expect(field).to.be.equal('name');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"name" is required');
        });
    });

    // TODO: max name <= 256
    // TODO: user can create tags (userAccessToken)
  });

  describe('GET /v1/tags', () => {
    // TODO: each user can see only own tags
    it('should get all tags created by admin', () => {
      return request(app)
        .get('/v1/tags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK)
        .then(async res => {
          const firstTag = await format(dbTags.firstTag);
          const secondTag = await format(dbTags.secondTag);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);
          res.body[1].createdAt = new Date(res.body[1].createdAt);

          const includesFirstTag = some(res.body, firstTag);
          const includesSecondTag = some(res.body, secondTag);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesFirstTag).to.be.true;
          expect(includesSecondTag).to.be.true;
        });
    });

    it('should get all tags with pagination', () => {
      return request(app)
        .get('/v1/tags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, perPage: 1 })
        .expect(httpStatus.OK)
        .then(async res => {
          const secondTag = await format(dbTags.secondTag);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);

          const includesSecondTag = some(res.body, secondTag);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesSecondTag).to.be.true;
        });
    });

    // it('should filter tags by regular expression in name field', () => {
    //   return request(app)
    //     .get('/v1/tags')
    //     .set('Authorization', `Bearer ${adminAccessToken}`)
    //     .query({
    //       name: first(dbTags.secondTag.name.split(' ')).toLowerCase(),
    //     })
    //     .expect(httpStatus.OK)
    //     .then(async res => {
    //       const secondTag = await format(dbTags.secondTag);

    //       // before comparing it is necessary to convert String to Date
    //       res.body[0].createdAt = new Date(res.body[0].createdAt);

    //       const includesSecondTag = some(res.body, secondTag);

    //       expect(res.body).to.be.an('array');
    //       expect(res.body).to.have.lengthOf(1);
    //       expect(includesSecondTag).to.be.true;
    //     });
    // });

    it("should report error when pagination's parameters are not a number", () => {
      return request(app)
        .get('/v1/tags')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: '?', perPage: 'whaat' })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field, location, messages } = res.body.errors[0];
          expect(field).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then(res => {
          const { field, location, messages } = res.body.errors[1];
          expect(field).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });
  });

  describe('GET /v1/tags/:id', () => {
    it('should get tag', async () => {
      const id = (await Tag.findOne({}))._id;
      return request(app)
        .get(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.include(dbTags.firstTag);
        });
    });

    it('should report error "Tag does not exist" when tag does not exists', () => {
      return request(app)
        .get('/v1/tags/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });

    it('should report error "Tag does not exist" when id is not a valid ObjectID', () => {
      return request(app)
        .get('/v1/tags/not-a-valid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.equal('Tag does not exist');
        });
    });

    // TODO: Must be FORBIDDEN
    it('should report error when logged user is not the requested tag owner', async () => {
      const id = (await Tag.findOne({}))._id;

      return request(app)
        .get(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });
  });

  describe('PUT /v1/tags/:id', () => {
    it('should replace tag', async () => {
      const id = (await Tag.findOne(dbTags.secondTag))._id;

      return request(app)
        .put(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(tag)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.include(tag);
          expect(res.body.color).to.be.equal('gray');
        });
    });

    it('should report error when name is not provided', async () => {
      const id = (await Tag.findOne({}))._id;
      delete tag.name;

      return request(app)
        .put(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(tag)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field, location, messages } = res.body.errors[0];
          expect(field).to.be.equal('name');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"name" is required');
        });
    });

    it('should report error "Tag does not exist" when tag does not exists', () => {
      return request(app)
        .put('/v1/tags/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(tag)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });

    // TODO: Must be FORBIDDEN
    it('should report error when logged user is not the requested tag owner', async () => {
      const id = (await Tag.findOne({}))._id;

      return request(app)
        .put(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(tag)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });
  });

  describe('PATCH /v1/tags/:id', () => {
    it('should update tag', async () => {
      const id = (await Tag.findOne({}))._id;
      const { name } = tag;

      return request(app)
        .patch(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.name).to.be.equal(name);
          expect(res.body.color).to.be.equal(dbTags.firstTag.color);
        });
    });

    it('should not update tag when no parameters were given', async () => {
      const id = (await Tag.findOne(dbTags.secondTag))._id;

      return request(app)
        .patch(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.include(dbTags.secondTag);
        });
    });

    it('should report error "Tag does not exist" when tag does not exists', () => {
      return request(app)
        .patch('/v1/tags/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });

    // TODO: Must be FORBIDDEN
    it('should report error when logged user is not the requested tag owner', async () => {
      const id = (await Tag.findOne({}))._id;

      return request(app)
        .patch(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });
  });

  describe('DELETE /v1/tags', () => {
    it('should delete tag', async () => {
      const id = (await Tag.findOne({}))._id;

      return request(app)
        .delete(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/tags'))
        .then(async () => {
          const tags = await Tag.find({});
          expect(tags).to.have.lengthOf(1);
        });
    });

    it('should report error "Tag does not exist" when tag does not exists', () => {
      return request(app)
        .delete('/v1/tags/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });

    // TODO: Must be FORBIDDEN
    it('should report error when logged user is not the requested tag owner', async () => {
      const id = (await Tag.findOne({}))._id;

      return request(app)
        .delete(`/v1/tags/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Tag does not exist');
        });
    });
  });
});
