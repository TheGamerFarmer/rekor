const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');
const createEventsRouter = require('../controllers/event');
const { userContext } = require('../db/plugins/audit');
const { signAccessToken } = require('../controllers/services/auth-middleware');
const { clearRevokedSessions } = require('./helpers/redis');
const Event = require('../db/models/event');
const GroupMember = require('../db/models/group_member');

const association = { name: 'Gières Volley-Ball' };

/**
 * Builds a minimal Express app with just the event router and no OpenAPI validator.
 * Used to exercise code paths that the validator would intercept (e.g. invalid path params,
 * missing required fields in PUT, non-duplicate Mongoose errors).
 */
function buildDirectEventApp() {
  const a = express();
  a.use(express.json());
  a.use((req, res, next) => userContext.run({}, next));
  a.use('/event', createEventsRouter({ limit: 1000 }));
  // eslint-disable-next-line no-unused-vars
  a.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return a;
}
const UNKNOWN_ID = '000000000000000000000000';

const validEventBody = {
  date: '2025-04-01',
  place: 'Salle de sport',
  type: 'Match-amical',
  name: 'Match du mardi',
  description: 'Match amical contre une autre équipe',
};

describe('/event (avec un vrai mongod)', () => {
  let mongod;
  let groupId;
  let eventId;
  let adherentToken;
  let entraineurToken;
  let outsiderToken;
  let directApp;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'event-test-secret-with-at-least-32-bytes';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'event-test' });
    await Event.ensureIndexes();
    await GroupMember.ensureIndexes();
    directApp = buildDirectEventApp();
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
    const groupCollection = db.getDb().collection('group');
    const eventCollection = db.getDb().collection('event');
    const groupMemberCollection = db.getDb().collection('group_member');
    await groupCollection.deleteMany({});
    await eventCollection.deleteMany({});
    await groupMemberCollection.deleteMany({});

    const userId = new ObjectId('000000000000000000000003');
    const outsiderId = new ObjectId('000000000000000000000004');
    groupId = new ObjectId('000000000000000000000001');
    eventId = new ObjectId('000000000000000000000002');

    await groupCollection.insertOne({ _id: groupId, name: 'Équipe A', owner: userId });
    await eventCollection.insertOne({
      _id: eventId,
      date: new Date('2025-03-15T00:00:00.000Z'),
      place: 'Gymnase municipal',
      type: 'Entrainement',
      name: 'Entraînement du lundi',
      description: 'Entraînement hebdomadaire',
      group: groupId,
    });
    // userId is a member of groupId; outsiderId is not.
    await groupMemberCollection.insertOne({ group: groupId, user: userId });

    adherentToken = signAccessToken({ _id: userId, role: 'Adhérent' }, association);
    entraineurToken = signAccessToken({ _id: userId, role: 'Entraineur' }, association);
    outsiderToken = signAccessToken({ _id: outsiderId, role: 'Adhérent' }, association);
  });

  // ── GET /event ──────────────────────────────────────────────────────────────

  it('GET /event lists events with essential fields', async () => {
    const res = await request(app).get('/event').set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, eventId.toString());
    assert.strictEqual(res.body[0].name, 'Entraînement du lundi');
  });

  it('GET /event returns 401 without authentication', async () => {
    const res = await request(app).get('/event');

    assert.strictEqual(res.status, 401);
  });

  it('GET /event returns an empty array for a user with no group membership', async () => {
    const res = await request(app).get('/event').set('Authorization', `Bearer ${outsiderToken}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, []);
  });

  // ── GET /event/:id ──────────────────────────────────────────────────────────

  it('GET /event/:id returns event details', async () => {
    const res = await request(app)
      .get(`/event/${eventId}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, eventId.toString());
    assert.strictEqual(res.body.name, 'Entraînement du lundi');
  });

  it('GET /event/:id returns 404 when event does not exist', async () => {
    const res = await request(app)
      .get(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('GET /event/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .get('/event/pas-un-id')
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 400);
  });

  it('GET /event/:id returns 401 when the user is not a member of the event group', async () => {
    const res = await request(app)
      .get(`/event/${eventId}`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.message, "L'utilisateur ne fait pas partie du groupe");
  });

  // ── PUT /event/:id ──────────────────────────────────────────────────────────

  it('PUT /event/:id creates a new event and returns 201', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ ...validEventBody, group: groupId.toString() });

    assert.strictEqual(res.status, 201);
  });

  it('PUT /event/:id returns 400 when a required field is missing', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        place: validEventBody.place,
        type: validEventBody.type,
        name: validEventBody.name,
        description: validEventBody.description,
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 400);
  });

  it('PUT /event/:id returns 400 for an invalid event type', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ ...validEventBody, type: 'TypeInvalide', group: groupId.toString() });

    assert.strictEqual(res.status, 400);
  });

  it('PUT /event/:id returns 404 when the group does not exist', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ ...validEventBody, group: UNKNOWN_ID });

    assert.strictEqual(res.status, 404);
  });

  it('PUT /event/:id returns 409 when the event already exists', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: '2025-03-15',
        place: 'Gymnase municipal',
        type: 'Entrainement',
        name: 'Entraînement du lundi',
        description: 'Entraînement hebdomadaire',
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 409);
  });

  it('PUT /event/:id returns 401 without authentication', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .send({ ...validEventBody, group: groupId.toString() });

    assert.strictEqual(res.status, 401);
  });

  it('PUT /event/:id returns 403 for an Adhérent role', async () => {
    const res = await request(app)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${adherentToken}`)
      .send({ ...validEventBody, group: groupId.toString() });

    assert.strictEqual(res.status, 403);
  });

  // ── PATCH /event/:id ────────────────────────────────────────────────────────

  it('PATCH /event/:id updates the event and returns 204', async () => {
    const res = await request(app)
      .patch(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Entraînement du mercredi', group: groupId.toString() });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('event').findOne({ _id: eventId });
    assert.strictEqual(updated.name, 'Entraînement du mercredi');
  });

  it('PATCH /event/:id returns 404 when the event does not exist', async () => {
    const res = await request(app)
      .patch(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nouveau nom', group: groupId.toString() });

    assert.strictEqual(res.status, 404);
  });

  it('PATCH /event/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .patch('/event/pas-un-id')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nouveau nom', group: groupId.toString() });

    assert.strictEqual(res.status, 400);
  });

  // ── DELETE /event/:id ───────────────────────────────────────────────────────

  it('DELETE /event/:id deletes the event and returns 204', async () => {
    const res = await request(app)
      .delete(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 204);
    const deleted = await db.getDb().collection('event').findOne({ _id: eventId });
    assert.strictEqual(deleted, null);
  });

  it('DELETE /event/:id returns 404 when the event does not exist', async () => {
    const res = await request(app)
      .delete(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('DELETE /event/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .delete('/event/pas-un-id')
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 400);
  });

  it('DELETE /event/:id returns 401 without authentication', async () => {
    const res = await request(app).delete(`/event/${eventId}`);

    assert.strictEqual(res.status, 401);
  });

  it('DELETE /event/:id returns 403 for an Adhérent role', async () => {
    const res = await request(app)
      .delete(`/event/${eventId}`)
      .set('Authorization', `Bearer ${adherentToken}`);

    assert.strictEqual(res.status, 403);
  });

  // ── PUT validation branches (bypass OpenAPI validator via directApp) ─────────

  it('PUT /event/pas-un-id returns 400 for a malformed identifier (direct router)', async () => {
    const res = await request(directApp)
      .put('/event/pas-un-id')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ ...validEventBody, group: groupId.toString() });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('PUT /event/:id returns 400 when date is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        place: validEventBody.place,
        type: validEventBody.type,
        name: validEventBody.name,
        description: validEventBody.description,
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Date invalide');
  });

  it('PUT /event/:id returns 400 when place is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        type: validEventBody.type,
        name: validEventBody.name,
        description: validEventBody.description,
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Emplacement invalide');
  });

  it('PUT /event/:id returns 400 when type is invalid (direct router)', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        place: validEventBody.place,
        type: 'TypeInvalide',
        name: validEventBody.name,
        description: validEventBody.description,
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.startsWith('Type invalide'));
  });

  it('PUT /event/:id returns 400 when name is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        place: validEventBody.place,
        type: validEventBody.type,
        description: validEventBody.description,
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Nom invalide');
  });

  it('PUT /event/:id returns 400 when description is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        place: validEventBody.place,
        type: validEventBody.type,
        name: validEventBody.name,
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Description invalide');
  });

  it('PUT /event/:id returns 400 when group is missing (direct router)', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ ...validEventBody });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'group invalide');
  });

  it('PUT /event/:id returns 500 when Event.create throws an unexpected error', async () => {
    const original = Event.create.bind(Event);
    Event.create = async () => {
      const err = new Error('unexpected db error');
      err.code = 99999;
      throw err;
    };

    try {
      const res = await request(directApp)
        .put(`/event/${UNKNOWN_ID}`)
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send({ ...validEventBody, group: groupId.toString() });

      assert.strictEqual(res.status, 500);
    } finally {
      Event.create = original;
    }
  });

  // ── PATCH field branches ─────────────────────────────────────────────────────

  it('PATCH /event/:id updates all fields when all are provided', async () => {
    const res = await request(app)
      .patch(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: '2025-04-10',
        place: 'Salle omnisports',
        type: 'Match-compétitif',
        name: 'Match de championnat',
        description: 'Match de championnat régional',
        group: groupId.toString(),
      });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('event').findOne({ _id: eventId });
    assert.strictEqual(updated.name, 'Match de championnat');
    assert.strictEqual(updated.place, 'Salle omnisports');
    assert.strictEqual(updated.type, 'Match-compétitif');
    assert.strictEqual(updated.description, 'Match de championnat régional');
    assert.deepStrictEqual(updated.date, new Date('2025-04-10T00:00:00.000Z'));
  });

  it('PATCH /event/:id returns 404 when group is omitted (bug: group always required)', async () => {
    const res = await request(app)
      .patch(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nom sans groupe' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });
});
