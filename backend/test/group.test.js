const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');
const createGroupsRouter = require('../controllers/group');
const { userContext } = require('../db/plugins/audit');
const { signAccessToken } = require('../controllers/services/auth-middleware');
const { clearRevokedSessions } = require('./helpers/redis');
const Group = require('../db/models/group');
const GroupMember = require('../db/models/group_member');
const User = require('../db/models/user');

const association = { name: 'Gières Volley-Ball' };

/**
 * Builds a minimal Express app with just the group router and no OpenAPI validator.
 * Used to exercise code paths that the validator would intercept (e.g. invalid path params,
 * missing required fields in PUT, non-duplicate Mongoose errors).
 */
function buildDirectGroupApp() {
  const a = express();
  a.use(express.json());
  a.use((req, res, next) => userContext.run({}, next));
  a.use('/group', createGroupsRouter({ limit: 1000 }));
  // eslint-disable-next-line no-unused-vars
  a.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return a;
}

const UNKNOWN_ID = '000000000000000000000000';

describe('/group (avec un vrai mongod)', () => {
  let mongod;
  let groupId;
  let ownerId;
  let memberId;
  let adherentToken;
  let entraineurToken;
  let directApp;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'group-test-secret-with-at-least-32-bytes';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'group-test' });
    await Group.ensureIndexes();
    await GroupMember.ensureIndexes();
    await User.ensureIndexes();
    directApp = buildDirectGroupApp();
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
    await userCollection.deleteMany({});
    await groupCollection.deleteMany({});
    await groupMemberCollection.deleteMany({});

    ownerId = new ObjectId('000000000000000000000001');
    memberId = new ObjectId('000000000000000000000002');
    groupId = new ObjectId('000000000000000000000003');

    await userCollection.insertOne({
      _id: ownerId,
      name: 'Lovelace',
      firstName: 'Ada',
      email: 'ada@exemple.fr',
      password: 'hashed',
      role: 'Entraineur',
      pronoun: 'Elle',
    });
    await userCollection.insertOne({
      _id: memberId,
      name: 'Turing',
      firstName: 'Alan',
      email: 'alan@exemple.fr',
      password: 'hashed',
      role: 'Adhérent',
      pronoun: 'Il',
    });

    await groupCollection.insertOne({ _id: groupId, name: 'Équipe A', owner: ownerId });
    // memberId is a member of groupId; ownerId is not explicitly added as member.
    await groupMemberCollection.insertOne({ group: groupId, user: memberId });

    adherentToken = signAccessToken({ _id: ownerId, role: 'Adhérent' }, association);
    entraineurToken = signAccessToken({ _id: ownerId, role: 'Entraineur' }, association);
  });

  // ── GET /group/:id ──────────────────────────────────────────────────────────

  it('GET /group/:id returns group details', async () => {
    const res = await request(app)
      .get(`/group/${groupId}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, groupId.toString());
    assert.strictEqual(res.body.name, 'Équipe A');
    assert.strictEqual(res.body.owner, ownerId.toString());
  });

  it('GET /group/:id returns 404 when group does not exist', async () => {
    const res = await request(app)
      .get(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('GET /group/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .get('/group/pas-un-id')
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 400);
  });

  it('GET /group/:id returns 401 without authentication', async () => {
    const res = await request(app).get(`/group/${groupId}`);

    assert.strictEqual(res.status, 401);
  });

  // ── PUT /group/:id ──────────────────────────────────────────────────────────

  it('PUT /group/:id creates a new group and returns 201', async () => {
    const newGroupId = new ObjectId('000000000000000000000099');
    const res = await request(app)
      .put(`/group/${newGroupId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Équipe B', owner: ownerId.toString() });

    assert.strictEqual(res.status, 201);
  });

  it('PUT /group/:id returns 404 when owner does not exist', async () => {
    const res = await request(app)
      .put(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Équipe C', owner: UNKNOWN_ID });

    assert.strictEqual(res.status, 404);
  });

  it('PUT /group/:id returns 401 without authentication', async () => {
    const res = await request(app)
      .put(`/group/${UNKNOWN_ID}`)
      .send({ name: 'Équipe D', owner: ownerId.toString() });

    assert.strictEqual(res.status, 401);
  });

  it('PUT /group/:id returns 403 for an Adhérent role', async () => {
    const res = await request(app)
      .put(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${adherentToken}`)
      .send({ name: 'Équipe E', owner: ownerId.toString() });

    assert.strictEqual(res.status, 403);
  });

  it('PUT /group/pas-un-id returns 400 for a malformed identifier (direct router)', async () => {
    const res = await request(directApp)
      .put('/group/pas-un-id')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Équipe F', owner: ownerId.toString() });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('PUT /group/:id returns 400 when name is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ owner: ownerId.toString() });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Nom invalide');
  });

  it('PUT /group/:id returns 400 when owner is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Équipe G' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Propriétaire invalide');
  });

  it('PUT /group/:id returns 409 when Group.create throws a duplicate key error (direct router)', async () => {
    const original = Group.create.bind(Group);
    Group.create = async () => {
      const err = new Error('duplicate key');
      err.code = 11000;
      throw err;
    };

    try {
      const res = await request(directApp)
        .put(`/group/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send({ name: 'Équipe H', owner: ownerId.toString() });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.message, 'Ce groupe existe déjà');
    } finally {
      Group.create = original;
    }
  });

  it('PUT /group/:id returns 500 when Group.create throws an unexpected error', async () => {
    const original = Group.create.bind(Group);
    Group.create = async () => {
      const err = new Error('unexpected db error');
      err.code = 99999;
      throw err;
    };

    try {
      const res = await request(directApp)
        .put(`/group/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send({ name: 'Équipe H', owner: ownerId.toString() });

      assert.strictEqual(res.status, 500);
    } finally {
      Group.create = original;
    }
  });

  // ── PATCH /group/:id ────────────────────────────────────────────────────────

  it('PATCH /group/:id updates the name and returns 204', async () => {
    const res = await request(app)
      .patch(`/group/${groupId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Équipe B' });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('group').findOne({ _id: groupId });
    assert.strictEqual(updated.name, 'Équipe B');
  });

  it('PATCH /group/:id updates the owner and returns 204', async () => {
    const res = await request(app)
      .patch(`/group/${groupId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ owner: memberId.toString() });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('group').findOne({ _id: groupId });
    assert.deepStrictEqual(updated.owner, memberId);
  });

  it('PATCH /group/:id returns 404 when group does not exist', async () => {
    const res = await request(app)
      .patch(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nouveau nom' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });

  it('PATCH /group/:id returns 404 when the new owner does not exist', async () => {
    const res = await request(app)
      .patch(`/group/${groupId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ owner: UNKNOWN_ID });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Utilisateur introuvable');
  });

  it('PATCH /group/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .patch('/group/pas-un-id')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nouveau nom' });

    assert.strictEqual(res.status, 400);
  });

  // ── DELETE /group/:id ───────────────────────────────────────────────────────

  it('DELETE /group/:id deletes the group and returns 204', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 204);
    const deleted = await db.getDb().collection('group').findOne({ _id: groupId });
    assert.strictEqual(deleted, null);
  });

  it('DELETE /group/:id returns 404 when group does not exist', async () => {
    const res = await request(app)
      .delete(`/group/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('DELETE /group/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .delete('/group/pas-un-id')
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 400);
  });

  it('DELETE /group/:id returns 401 without authentication', async () => {
    const res = await request(app).delete(`/group/${groupId}`);

    assert.strictEqual(res.status, 401);
  });

  it('DELETE /group/:id returns 403 for an Adhérent role', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 403);
  });

  // ── GET /group/:id/members ──────────────────────────────────────────────────

  it('GET /group/:id/members returns the list of members', async () => {
    const res = await request(app)
      .get(`/group/${groupId}/members`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, memberId.toString());
    assert.strictEqual(res.body[0].name, 'Turing');
  });

  it('GET /group/:id/members returns an empty array when there are no members', async () => {
    const emptyGroupId = new ObjectId('000000000000000000000098');
    await db
      .getDb()
      .collection('group')
      .insertOne({ _id: emptyGroupId, name: 'Équipe Vide', owner: ownerId });

    const res = await request(app)
      .get(`/group/${emptyGroupId}/members`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, []);
  });

  it('GET /group/:id/members returns 404 when group does not exist', async () => {
    const res = await request(app)
      .get(`/group/${UNKNOWN_ID}/members`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('GET /group/:id/members returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .get('/group/pas-un-id/members')
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 400);
  });

  it('GET /group/:id/members returns 401 without authentication', async () => {
    const res = await request(app).get(`/group/${groupId}/members`);

    assert.strictEqual(res.status, 401);
  });

  // ── PUT /group/:id/members/:userId ──────────────────────────────────────────

  it('PUT /group/:id/members/:userId adds a user and returns 201', async () => {
    const res = await request(app)
      .put(`/group/${groupId}/members/${ownerId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 201);
    const membership = await db
      .getDb()
      .collection('group_member')
      .findOne({ group: groupId, user: ownerId });
    assert.ok(membership);
  });

  it('PUT /group/:id/members/:userId returns 404 when group does not exist', async () => {
    const res = await request(app)
      .put(`/group/${UNKNOWN_ID}/members/${ownerId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });

  it('PUT /group/:id/members/:userId returns 404 when user does not exist', async () => {
    const res = await request(app)
      .put(`/group/${groupId}/members/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Utilisateur introuvable');
  });

  it('PUT /group/:id/members/:userId returns 409 when user is already a member', async () => {
    const res = await request(app)
      .put(`/group/${groupId}/members/${memberId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 409);
  });

  it('PUT /group/:id/members/:userId returns 401 without authentication', async () => {
    const res = await request(app).put(`/group/${groupId}/members/${ownerId}`);

    assert.strictEqual(res.status, 401);
  });

  it('PUT /group/:id/members/:userId returns 403 for an Adhérent role', async () => {
    const res = await request(app)
      .put(`/group/${groupId}/members/${ownerId}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 403);
  });

  it('PUT /group/pas-un-id/members/:userId returns 400 for a malformed group id (direct router)', async () => {
    const res = await request(directApp)
      .put(`/group/pas-un-id/members/${ownerId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('PUT /group/:id/members/pas-un-id returns 400 for a malformed user id (direct router)', async () => {
    const res = await request(directApp)
      .put(`/group/${groupId}/members/pas-un-id`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, "Identifiant d'utilisateur invalide");
  });

  it('PUT /group/:id/members/:userId returns 500 when GroupMember.create throws an unexpected error', async () => {
    const original = GroupMember.create.bind(GroupMember);
    GroupMember.create = async () => {
      const err = new Error('unexpected db error');
      err.code = 99999;
      throw err;
    };

    try {
      const res = await request(directApp)
        .put(`/group/${groupId}/members/${ownerId}`)
        .set('Authorization', `Bearer ${entraineurToken}`);

      assert.strictEqual(res.status, 500);
    } finally {
      GroupMember.create = original;
    }
  });

  // ── DELETE /group/:id/members/:userId ───────────────────────────────────────

  it('DELETE /group/:id/members/:userId removes a member and returns 204', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}/members/${memberId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 204);
    const membership = await db
      .getDb()
      .collection('group_member')
      .findOne({ group: groupId, user: memberId });
    assert.strictEqual(membership, null);
  });

  it('DELETE /group/:id/members/:userId returns 404 when group does not exist', async () => {
    const res = await request(app)
      .delete(`/group/${UNKNOWN_ID}/members/${memberId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });

  it('DELETE /group/:id/members/:userId returns 404 when user does not exist', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}/members/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Utilisateur introuvable');
  });

  it('DELETE /group/:id/members/:userId returns 404 when user is not in the group', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}/members/${ownerId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('DELETE /group/:id/members/:userId returns 401 without authentication', async () => {
    const res = await request(app).delete(`/group/${groupId}/members/${memberId}`);

    assert.strictEqual(res.status, 401);
  });

  it('DELETE /group/:id/members/:userId returns 403 for an Adhérent role', async () => {
    const res = await request(app)
      .delete(`/group/${groupId}/members/${memberId}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 403);
  });

  it('DELETE /group/pas-un-id/members/:userId returns 400 for a malformed group id (direct router)', async () => {
    const res = await request(directApp)
      .delete(`/group/pas-un-id/members/${memberId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('DELETE /group/:id/members/pas-un-id returns 400 for a malformed user id (direct router)', async () => {
    const res = await request(directApp)
      .delete(`/group/${groupId}/members/pas-un-id`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, "Identifiant d'utilisateur invalide");
  });
});
