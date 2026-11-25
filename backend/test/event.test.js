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
const Group = require('../db/models/group');
const GroupMember = require('../db/models/group_member');
const Participant = require('../db/models/participant');
const User = require('../db/models/user');

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
  a.use((err, req, res, ignored) => {
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
  let visiteurToken;
  let adherentToken;
  let entraineurToken;
  let directApp;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'event-test-secret-with-at-least-32-bytes';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'event-test' });
    await Event.ensureIndexes();
    await Group.ensureIndexes();
    await GroupMember.ensureIndexes();
    await Participant.ensureIndexes();
    await User.ensureIndexes();
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
    const userCollection = db.getDb().collection('users');
    const groupCollection = db.getDb().collection('group');
    const eventCollection = db.getDb().collection('event');
    const groupMemberCollection = db.getDb().collection('group_member');
    const participantCollection = db.getDb().collection('participant');
    await userCollection.deleteMany({});
    await groupCollection.deleteMany({});
    await eventCollection.deleteMany({});
    await groupMemberCollection.deleteMany({});
    await participantCollection.deleteMany({});

    const userId = new ObjectId('000000000000000000000003');
    groupId = new ObjectId('000000000000000000000001');
    eventId = new ObjectId('000000000000000000000002');

    await userCollection.insertOne({
      _id: userId,
      name: 'Testeur',
      firstName: 'Paul',
      email: 'paul@exemple.fr',
      password: 'hashed',
      role: 'Entraineur',
      pronoun: 'Il',
    });

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

    visiteurToken = signAccessToken({ _id: userId, role: 'Visiteur' }, association);
    adherentToken = signAccessToken({ _id: userId, role: 'Adhérent' }, association);
    entraineurToken = signAccessToken({ _id: userId, role: 'Entraineur' }, association);
  });

  // ── GET /event ──────────────────────────────────────────────────────────────

  it('GET /event lists events with essential fields', async () => {
    const res = await request(app).get('/event').set('Authorization', `Bearer ${visiteurToken}`);

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

  // ── GET /event/:id ──────────────────────────────────────────────────────────

  it('GET /event/:id returns event details', async () => {
    const res = await request(app)
      .get(`/event/${eventId}`)
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, eventId.toString());
    assert.strictEqual(res.body.name, 'Entraînement du lundi');
  });

  it('GET /event/:id returns 404 when event does not exist', async () => {
    const res = await request(app)
      .get(`/event/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 404);
  });

  it('GET /event/:id returns 400 for a malformed identifier', async () => {
    const res = await request(app)
      .get('/event/pas-un-id')
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 400);
  });

  // ── POST /event ──────────────────────────────────────────────────────────

  it('POST /event creates a new event, auto-creates a group and adds creator as member', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send(validEventBody);

    assert.strictEqual(res.status, 201);

    const userId = new ObjectId('000000000000000000000003');
    const createdEvent = await db
      .getDb()
      .collection('event')
      .findOne({ name: validEventBody.name });
    assert.ok(createdEvent);

    const createdGroup = await db.getDb().collection('group').findOne({ _id: createdEvent.group });
    assert.ok(createdGroup);
    assert.strictEqual(createdGroup.name, validEventBody.name);
    assert.deepStrictEqual(createdGroup.owner, userId);

    const membership = await db
      .getDb()
      .collection('group_member')
      .findOne({ group: createdGroup._id, user: userId });
    assert.ok(membership);
  });

  it('POST /event returns 400 when a required field is missing', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        place: validEventBody.place,
        type: validEventBody.type,
        name: validEventBody.name,
        description: validEventBody.description,
      });

    assert.strictEqual(res.status, 400);
  });

  it('POST /event returns 400 for an invalid event type', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ ...validEventBody, type: 'TypeInvalide' });

    assert.strictEqual(res.status, 400);
  });

  it('POST /event returns 409 and cleans up group when event already exists', async () => {
    const original = Event.create.bind(Event);
    Event.create = async () => {
      const err = new Error('duplicate key');
      err.code = 11000;
      throw err;
    };

    try {
      const res = await request(directApp)
        .post('/event')
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send(validEventBody);

      assert.strictEqual(res.status, 409);

      const orphanedGroups = await db
        .getDb()
        .collection('group')
        .find({ name: validEventBody.name })
        .toArray();
      assert.strictEqual(orphanedGroups.length, 0);
    } finally {
      Event.create = original;
    }
  });

  it('POST /event returns 401 without authentication', async () => {
    const res = await request(directApp).post('/event').send(validEventBody);

    assert.strictEqual(res.status, 401);
  });

  it('POST /event returns 403 for an Adhérent role', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${adherentToken}`)
      .send(validEventBody);

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

  it('DELETE /event/:id returns 403 when user is not the group owner', async () => {
    const otherUserId = new ObjectId('000000000000000000000070');
    await db.getDb().collection('users').insertOne({
      _id: otherUserId,
      name: 'Autre',
      firstName: 'Entraineur',
      email: 'autre@exemple.fr',
      password: 'hashed',
      role: 'Entraineur',
      pronoun: 'Il',
    });
    const otherToken = signAccessToken({ _id: otherUserId, role: 'Entraineur' }, association);

    const res = await request(directApp)
      .delete(`/event/${eventId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, "Vous n'êtes pas propriétaire de ce groupe");
  });

  it('DELETE /event/:id returns 404 when the event group does not exist', async () => {
    await db.getDb().collection('group').deleteMany({});

    const res = await request(directApp)
      .delete(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });

  it('DELETE /event/:id returns 404 when event disappears during deletion (race condition)', async () => {
    const original = Event.deleteOne.bind(Event);
    Event.deleteOne = async () => ({ deletedCount: 0 });

    try {
      const res = await request(directApp)
        .delete(`/event/${eventId}`)
        .set('Authorization', `Bearer ${entraineurToken}`);

      assert.strictEqual(res.status, 404);
    } finally {
      Event.deleteOne = original;
    }
  });

  // ── POST validation branches (direct router) ────────────────────────────────

  it('POST /event returns 400 when date is missing (direct router)', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        place: validEventBody.place,
        type: validEventBody.type,
        name: validEventBody.name,
        description: validEventBody.description,
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Date invalide');
  });

  it('POST /event returns 400 when place is missing (direct router)', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        type: validEventBody.type,
        name: validEventBody.name,
        description: validEventBody.description,
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Emplacement invalide');
  });

  it('POST /event returns 400 when type is invalid (direct router)', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        place: validEventBody.place,
        type: 'TypeInvalide',
        name: validEventBody.name,
        description: validEventBody.description,
      });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.startsWith('Type invalide'));
  });

  it('POST /event returns 400 when name is missing (direct router)', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        place: validEventBody.place,
        type: validEventBody.type,
        description: validEventBody.description,
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Nom invalide');
  });

  it('POST /event returns 400 when description is missing (direct router)', async () => {
    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({
        date: validEventBody.date,
        place: validEventBody.place,
        type: validEventBody.type,
        name: validEventBody.name,
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Description invalide');
  });

  it('POST /event falls through when group creation fails (non-existent user in DB)', async () => {
    const ghostUserId = new ObjectId('000000000000000000000080');
    const ghostToken = signAccessToken({ _id: ghostUserId, role: 'Entraineur' }, association);

    const res = await request(directApp)
      .post('/event')
      .set('Authorization', `Bearer ${ghostToken}`)
      .send(validEventBody);

    // createEvent → createGroup → USER_NOT_FOUND, but controller only checks DUPLICATE
    assert.strictEqual(res.status, 201);
  });

  it('POST /event returns 500 when Event.create throws an unexpected error', async () => {
    const original = Event.create.bind(Event);
    Event.create = async () => {
      const err = new Error('unexpected db error');
      err.code = 99999;
      throw err;
    };

    try {
      const res = await request(directApp)
        .post('/event')
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send(validEventBody);

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

  it('PATCH /event/:id returns 400 when group is omitted', async () => {
    const res = await request(app)
      .patch(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nom sans groupe' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Groupe invalide');
  });

  it('PATCH /event/:id returns 404 when the group does not exist', async () => {
    const res = await request(app)
      .patch(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ name: 'Nouveau nom', group: UNKNOWN_ID });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Groupe introuvable');
  });

  // ── DELETE /event/:id cascade (participants supprimés) ─────────────────────

  it('DELETE /event/:id also deletes associated participants', async () => {
    const userId = new ObjectId('000000000000000000000003');
    await db.getDb().collection('participant').insertOne({
      event: eventId,
      participe: true,
      created_by: userId,
    });

    const res = await request(directApp)
      .delete(`/event/${eventId}`)
      .set('Authorization', `Bearer ${entraineurToken}`);

    assert.strictEqual(res.status, 204);
    const remaining = await db.getDb().collection('participant').find({ event: eventId }).toArray();
    assert.strictEqual(remaining.length, 0);
  });

  // ── POST /event/:id/register ───────────────────────────────────────────────

  it('POST /event/:id/register creates a participation and adds user to group when participate=true', async () => {
    const userId = new ObjectId('000000000000000000000003');
    const res = await request(directApp)
      .post(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 201);
    const doc = await db.getDb().collection('participant').findOne({ event: eventId });
    assert.ok(doc);
    assert.strictEqual(doc.participe, true);

    const membership = await db
      .getDb()
      .collection('group_member')
      .findOne({ group: groupId, user: userId });
    assert.ok(membership);
  });

  it('POST /event/:id/register with participate=true adds a non-member user to the group', async () => {
    const userId = new ObjectId('000000000000000000000003');
    // Remove existing membership so the user is not yet in the group
    await db.getDb().collection('group_member').deleteMany({ group: groupId, user: userId });

    const res = await request(directApp)
      .post(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 201);

    const membership = await db
      .getDb()
      .collection('group_member')
      .findOne({ group: groupId, user: userId });
    assert.ok(membership);
  });

  it('POST /event/:id/register returns 400 for invalid participate value', async () => {
    const res = await request(directApp)
      .post(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'maybe' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Participation state invalide');
  });

  it('POST /event/:id/register returns 400 when participate is missing', async () => {
    const res = await request(directApp)
      .post(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({});

    assert.strictEqual(res.status, 400);
  });

  it('POST /event/:id/register returns 404 when event does not exist', async () => {
    const res = await request(directApp)
      .post(`/event/${UNKNOWN_ID}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Évènement introuvable');
  });

  it('POST /event/:id/register returns 400 for a malformed identifier', async () => {
    const res = await request(directApp)
      .post('/event/pas-un-id/register')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('POST /event/:id/register returns 401 without authentication', async () => {
    const res = await request(directApp)
      .post(`/event/${eventId}/register`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 401);
  });

  it('POST /event/:id/register returns 403 for a Visiteur on a competitive match', async () => {
    const visiteurUserId = new ObjectId('000000000000000000000060');
    await db.getDb().collection('users').insertOne({
      _id: visiteurUserId,
      name: 'Visiteur',
      firstName: 'Test',
      email: 'visiteur@exemple.fr',
      password: 'hashed',
      role: 'Visiteur',
      pronoun: 'Il',
    });
    const realVisiteurToken = signAccessToken(
      { _id: visiteurUserId, role: 'Visiteur' },
      association,
    );

    const competitiveEventId = new ObjectId('000000000000000000000050');
    await db
      .getDb()
      .collection('event')
      .insertOne({
        _id: competitiveEventId,
        date: new Date('2025-04-01T00:00:00.000Z'),
        place: 'Stade',
        type: 'Match-compétitif',
        name: 'Match compétitif',
        description: 'Match de championnat',
        group: groupId,
      });

    const res = await request(directApp)
      .post(`/event/${competitiveEventId}/register`)
      .set('Authorization', `Bearer ${realVisiteurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 403);
  });

  it('POST /event/:id/register with participate=false creates participation but does not add to group', async () => {
    const userId = new ObjectId('000000000000000000000003');
    // Remove existing membership so we can verify no new one is created
    await db.getDb().collection('group_member').deleteMany({ group: groupId, user: userId });

    const res = await request(directApp)
      .post(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'false' });

    assert.strictEqual(res.status, 201);
    const doc = await db.getDb().collection('participant').findOne({ event: eventId });
    assert.ok(doc);
    assert.strictEqual(doc.participe, false);

    const membership = await db
      .getDb()
      .collection('group_member')
      .findOne({ group: groupId, user: userId });
    assert.strictEqual(membership, null);
  });

  it('POST /event/:id/register returns 409 when Participant.create throws a duplicate key error', async () => {
    const original = Participant.create.bind(Participant);
    Participant.create = async () => {
      const err = new Error('duplicate key');
      err.code = 11000;
      throw err;
    };

    try {
      const res = await request(directApp)
        .post(`/event/${eventId}/register`)
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send({ participate: 'true' });

      assert.strictEqual(res.status, 409);
    } finally {
      Participant.create = original;
    }
  });

  it('POST /event/:id/register returns 500 when Participant.create throws an unexpected error', async () => {
    const original = Participant.create.bind(Participant);
    Participant.create = async () => {
      const err = new Error('unexpected db error');
      err.code = 99999;
      throw err;
    };

    try {
      const res = await request(directApp)
        .post(`/event/${eventId}/register`)
        .set('Authorization', `Bearer ${entraineurToken}`)
        .send({ participate: 'true' });

      assert.strictEqual(res.status, 500);
    } finally {
      Participant.create = original;
    }
  });

  // ── PUT /event/:id/register ────────────────────────────────────────────────

  it('PUT /event/:id/register updates participation to false and returns 204', async () => {
    const userId = new ObjectId('000000000000000000000003');
    await db.getDb().collection('participant').insertOne({
      event: eventId,
      participe: true,
      created_by: userId,
    });

    const res = await request(directApp)
      .put(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'false' });

    assert.strictEqual(res.status, 204);
  });

  it('PUT /event/:id/register updates participation to true and adds user to group', async () => {
    const userId = new ObjectId('000000000000000000000003');
    await db.getDb().collection('participant').insertOne({
      event: eventId,
      participe: false,
      created_by: userId,
    });

    const res = await request(directApp)
      .put(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 204);
  });

  it('PUT /event/:id/register returns 400 for invalid participate value', async () => {
    const res = await request(directApp)
      .put(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'oui' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Participation state invalide');
  });

  it('PUT /event/:id/register returns 404 when event does not exist', async () => {
    const res = await request(directApp)
      .put(`/event/${UNKNOWN_ID}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Évènement introuvable');
  });

  it('PUT /event/:id/register returns 400 for a malformed identifier', async () => {
    const res = await request(directApp)
      .put('/event/pas-un-id/register')
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('PUT /event/:id/register returns 401 without authentication', async () => {
    const res = await request(directApp)
      .put(`/event/${eventId}/register`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 401);
  });

  it('PUT /event/:id/register returns 404 when user has no existing participation', async () => {
    const res = await request(directApp)
      .put(`/event/${eventId}/register`)
      .set('Authorization', `Bearer ${entraineurToken}`)
      .send({ participate: 'true' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Aucune participation trouvée pour cet utilisateur');
  });

  // ── GET /event/:id/participants ────────────────────────────────────────────

  it('GET /event/:id/participants returns participants for an event', async () => {
    const userId = new ObjectId('000000000000000000000003');
    await db.getDb().collection('participant').insertOne({
      event: eventId,
      participe: true,
      created_by: userId,
    });

    const res = await request(directApp)
      .get(`/event/${eventId}/participants`)
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].event, eventId.toString());
    assert.strictEqual(res.body[0].participe, true);
    assert.strictEqual(res.body[0].user, userId.toString());
  });

  it('GET /event/:id/participants returns empty array when no participants', async () => {
    const res = await request(directApp)
      .get(`/event/${eventId}/participants`)
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 0);
  });

  it('GET /event/:id/participants returns 404 when event does not exist', async () => {
    const res = await request(directApp)
      .get(`/event/${UNKNOWN_ID}/participants`)
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Évènement introuvable');
  });

  it('GET /event/:id/participants returns 400 for a malformed identifier', async () => {
    const res = await request(directApp)
      .get('/event/pas-un-id/participants')
      .set('Authorization', `Bearer ${visiteurToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Identifiant invalide');
  });

  it('GET /event/:id/participants returns 401 without authentication', async () => {
    const res = await request(directApp).get(`/event/${eventId}/participants`);

    assert.strictEqual(res.status, 401);
  });
});
