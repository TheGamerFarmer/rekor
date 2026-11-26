const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');
const createMessagesRouter = require('../controllers/message');
const { userContext } = require('../db/plugins/audit');
const { signAccessToken } = require('../controllers/services/auth-middleware');
const { clearRevokedSessions } = require('./helpers/redis');
const Group = require('../db/models/group');
const GroupMember = require('../db/models/group_member');
const Message = require('../db/models/message');
const User = require('../db/models/user');

const association = { name: 'Gières Volley-Ball' };

/**
 * Builds a minimal Express app with the message router and no OpenAPI validator.
 * Used to exercise code paths that the validator would intercept.
 */
function buildDirectMessageApp() {
  const a = express();
  a.use(express.json());
  a.use((req, res, next) => userContext.run({}, next));
  a.use('/group/:groupId/messages', createMessagesRouter({ limit: 1000 }));
  // eslint-disable-next-line no-unused-vars
  a.use((err, req, res, ignored) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return a;
}

const UNKNOWN_ID = '000000000000000000000000';

describe('/group/:groupId/messages (avec un vrai mongod)', () => {
  let mongod;
  let groupId;
  let ownerId;
  let memberId;
  let nonMemberId;
  let adminId;
  let messageId;
  let ownerToken;
  let memberToken;
  let nonMemberToken;
  let adminToken;
  let directApp;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'message-test-secret-with-at-least-32-bytes';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'message-test' });
    await Group.ensureIndexes();
    await GroupMember.ensureIndexes();
    await Message.ensureIndexes();
    await User.ensureIndexes();
    directApp = buildDirectMessageApp();
  });

  after(async () => {
    await db.close();
    await mongod.stop();
    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }
  });

  beforeEach(async () => {
    clearRevokedSessions();
    const userCollection = db.getDb().collection('users');
    const groupCollection = db.getDb().collection('group');
    const groupMemberCollection = db.getDb().collection('group_member');
    const messageCollection = db.getDb().collection('message');
    await userCollection.deleteMany({});
    await groupCollection.deleteMany({});
    await groupMemberCollection.deleteMany({});
    await messageCollection.deleteMany({});

    ownerId = new ObjectId('000000000000000000000001');
    memberId = new ObjectId('000000000000000000000002');
    nonMemberId = new ObjectId('000000000000000000000003');
    adminId = new ObjectId('000000000000000000000004');
    groupId = new ObjectId('000000000000000000000010');
    messageId = new ObjectId('000000000000000000000020');

    await userCollection.insertMany([
      {
        _id: ownerId,
        name: 'Lovelace',
        firstName: 'Ada',
        email: 'ada@exemple.fr',
        password: 'hashed',
        role: 'Entraineur',
        pronoun: 'Elle',
      },
      {
        _id: memberId,
        name: 'Turing',
        firstName: 'Alan',
        email: 'alan@exemple.fr',
        password: 'hashed',
        role: 'Adhérent',
        pronoun: 'Il',
      },
      {
        _id: nonMemberId,
        name: 'Hopper',
        firstName: 'Grace',
        email: 'grace@exemple.fr',
        password: 'hashed',
        role: 'Adhérent',
        pronoun: 'Elle',
      },
      {
        _id: adminId,
        name: 'Dijkstra',
        firstName: 'Edsger',
        email: 'edsger@exemple.fr',
        password: 'hashed',
        role: 'Administrateur',
        pronoun: 'Il',
      },
    ]);

    await groupCollection.insertOne({ _id: groupId, name: 'Équipe A', owner: ownerId });
    await groupMemberCollection.insertMany([
      { group: groupId, user: ownerId },
      { group: groupId, user: memberId },
      { group: groupId, user: adminId },
    ]);

    await messageCollection.insertOne({
      _id: messageId,
      group: groupId,
      body: 'Hello world',
      created_by: memberId,
      created_at: new Date('2025-03-15T10:30:00.000Z'),
    });

    ownerToken = signAccessToken({ _id: ownerId, role: 'Entraineur' }, association);
    memberToken = signAccessToken({ _id: memberId, role: 'Adhérent' }, association);
    nonMemberToken = signAccessToken({ _id: nonMemberId, role: 'Adhérent' }, association);
    adminToken = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);
  });

  // ── GET /group/:groupId/messages ──────────────────────────────────────────

  it('GET /group/:groupId/messages lists all messages in the group', async () => {
    const res = await request(app)
      .get(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, messageId.toString());
    assert.strictEqual(res.body[0].body, 'Hello world');
    assert.strictEqual(res.body[0].author, memberId.toString());
  });

  it('GET /group/:groupId/messages returns an empty array when there are no messages', async () => {
    await db.getDb().collection('message').deleteMany({});

    const res = await request(app)
      .get(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, []);
  });

  it('GET /group/:groupId/messages returns 401 without authentication', async () => {
    const res = await request(app).get(`/group/${groupId}/messages`);

    assert.strictEqual(res.status, 401);
  });

  it('GET /group/:groupId/messages returns 403 when user is not a member', async () => {
    const res = await request(directApp)
      .get(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${nonMemberToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'appartenez pas à ce groupe");
  });

  it('GET /group/:groupId/messages returns 404 when group does not exist', async () => {
    const res = await request(directApp)
      .get(`/group/${UNKNOWN_ID}/messages`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });

  it('GET /group/:groupId/messages returns 400 for a malformed group id (direct router)', async () => {
    const res = await request(directApp)
      .get('/group/pas-un-id/messages')
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Groupe invalide');
  });

  // ── GET /group/:groupId/messages/:id ──────────────────────────────────────

  it('GET /group/:groupId/messages/:id returns a single message', async () => {
    const res = await request(app)
      .get(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, messageId.toString());
    assert.strictEqual(res.body.body, 'Hello world');
    assert.strictEqual(res.body.author, memberId.toString());
  });

  it('GET /group/:groupId/messages/:id returns 404 when message does not exist', async () => {
    const res = await request(app)
      .get(`/group/${groupId}/messages/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('GET /group/:groupId/messages/:id returns 400 for a malformed message id (direct router)', async () => {
    const res = await request(directApp)
      .get(`/group/${groupId}/messages/pas-un-id`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('GET /group/:groupId/messages/:id returns 401 without authentication', async () => {
    const res = await request(app).get(`/group/${groupId}/messages/${messageId}`);

    assert.strictEqual(res.status, 401);
  });

  it('GET /group/:groupId/messages/:id returns 404 for a message from another group', async () => {
    const otherGroupId = new ObjectId('000000000000000000000011');
    await db
      .getDb()
      .collection('group')
      .insertOne({ _id: otherGroupId, name: 'Équipe B', owner: ownerId });
    await db.getDb().collection('group_member').insertOne({ group: otherGroupId, user: memberId });

    const otherMessageId = new ObjectId('000000000000000000000021');
    await db.getDb().collection('message').insertOne({
      _id: otherMessageId,
      group: otherGroupId,
      body: 'Other group message',
      created_by: memberId,
      created_at: new Date(),
    });

    // Request the other message via the first group → should be 404
    const res = await request(directApp)
      .get(`/group/${groupId}/messages/${otherMessageId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Message introuvable');
  });

  // ── POST /group/:groupId/messages ─────────────────────────────────────────

  it('POST /group/:groupId/messages creates a new message and returns 201', async () => {
    const res = await request(app)
      .post(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ body: 'New message' });

    assert.strictEqual(res.status, 201);

    const created = await db.getDb().collection('message').findOne({ body: 'New message' });
    assert.ok(created);
    assert.deepStrictEqual(created.group, groupId);
  });

  it('POST /group/:groupId/messages sets created_by from the authenticated user', async () => {
    const res = await request(directApp)
      .post(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ body: 'Audit test' });

    assert.strictEqual(res.status, 201);

    const created = await db.getDb().collection('message').findOne({ body: 'Audit test' });
    assert.ok(created);
    assert.deepStrictEqual(created.created_by, memberId);
  });

  it('POST /group/:groupId/messages returns 400 when body is missing (direct router)', async () => {
    const res = await request(directApp)
      .post(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({});

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Body invalide');
  });

  it('POST /group/:groupId/messages returns 401 without authentication', async () => {
    const res = await request(app).post(`/group/${groupId}/messages`).send({ body: 'No auth' });

    assert.strictEqual(res.status, 401);
  });

  it('POST /group/:groupId/messages returns 403 when user is not a member', async () => {
    const res = await request(directApp)
      .post(`/group/${groupId}/messages`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .send({ body: 'Intrus' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'appartenez pas à ce groupe");
  });

  it('POST /group/:groupId/messages returns 409 when Message.create throws a duplicate key error (direct router)', async () => {
    const original = Message.create.bind(Message);
    Message.create = async () => {
      const err = new Error('duplicate key');
      err.code = 11000;
      throw err;
    };

    try {
      const res = await request(directApp)
        .post(`/group/${groupId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ body: 'Duplicate' });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.message, 'Ce message existe déjà');
    } finally {
      Message.create = original;
    }
  });

  it('POST /group/:groupId/messages returns 500 when Message.create throws an unexpected error', async () => {
    const original = Message.create.bind(Message);
    Message.create = async () => {
      const err = new Error('unexpected db error');
      err.code = 99999;
      throw err;
    };

    try {
      const res = await request(directApp)
        .post(`/group/${groupId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ body: 'Error' });

      assert.strictEqual(res.status, 500);
    } finally {
      Message.create = original;
    }
  });

  // ── PATCH /group/:groupId/messages/:id ────────────────────────────────────

  it('PATCH /group/:groupId/messages/:id updates the message and returns 204', async () => {
    const res = await request(app)
      .patch(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ body: 'Updated message' });

    assert.strictEqual(res.status, 204);

    const updated = await db.getDb().collection('message').findOne({ _id: messageId });
    assert.strictEqual(updated.body, 'Updated message');
  });

  it('PATCH /group/:groupId/messages/:id returns 403 when user is not the author', async () => {
    const res = await request(directApp)
      .patch(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ body: 'Hijack' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'êtes pas l'auteur de ce message");
  });

  it('PATCH /group/:groupId/messages/:id returns 404 when message does not exist', async () => {
    const res = await request(directApp)
      .patch(`/group/${groupId}/messages/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ body: 'Ghost' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Message introuvable');
  });

  it('PATCH /group/:groupId/messages/:id returns 400 for a malformed message id (direct router)', async () => {
    const res = await request(directApp)
      .patch(`/group/${groupId}/messages/pas-un-id`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ body: 'Bad id' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('PATCH /group/:groupId/messages/:id returns 400 when body is missing (direct router)', async () => {
    const res = await request(directApp)
      .patch(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({});

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Body invalide');
  });

  it('PATCH /group/:groupId/messages/:id returns 401 without authentication', async () => {
    const res = await request(app)
      .patch(`/group/${groupId}/messages/${messageId}`)
      .send({ body: 'No auth' });

    assert.strictEqual(res.status, 401);
  });

  it('PATCH /group/:groupId/messages/:id returns 403 when user is not a member', async () => {
    const res = await request(directApp)
      .patch(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .send({ body: 'Intrus' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'appartenez pas à ce groupe");
  });

  // ── DELETE /group/:groupId/messages/:id ───────────────────────────────────

  it('DELETE /group/:groupId/messages/:id deletes the message and returns 204', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 204);

    const deleted = await db.getDb().collection('message').findOne({ _id: messageId });
    assert.strictEqual(deleted, null);
  });

  it('DELETE /group/:groupId/messages/:id allows an admin to delete any message', async () => {
    const res = await request(directApp)
      .delete(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 204);

    const deleted = await db.getDb().collection('message').findOne({ _id: messageId });
    assert.strictEqual(deleted, null);
  });

  it('DELETE /group/:groupId/messages/:id returns 403 when user is not the author', async () => {
    const res = await request(directApp)
      .delete(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'êtes pas l'auteur de ce message");
  });

  it('DELETE /group/:groupId/messages/:id returns 404 when message does not exist', async () => {
    const res = await request(directApp)
      .delete(`/group/${groupId}/messages/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Message introuvable');
  });

  it('DELETE /group/:groupId/messages/:id returns 400 for a malformed message id (direct router)', async () => {
    const res = await request(directApp)
      .delete(`/group/${groupId}/messages/pas-un-id`)
      .set('Authorization', `Bearer ${memberToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('DELETE /group/:groupId/messages/:id returns 401 without authentication', async () => {
    const res = await request(app).delete(`/group/${groupId}/messages/${messageId}`);

    assert.strictEqual(res.status, 401);
  });

  it('DELETE /group/:groupId/messages/:id returns 403 when user is not a member', async () => {
    const res = await request(directApp)
      .delete(`/group/${groupId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${nonMemberToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'appartenez pas à ce groupe");
  });
});
