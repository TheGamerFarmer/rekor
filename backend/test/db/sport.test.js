const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');

describe('collections sport', () => {
  let mongod, database;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
    database = res.database;
  });
  after(() => teardown(mongod));

  describe('event', () => {
    let col;
    before(() => {
      col = database.collection('event');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      date: new Date('2024-06-01'),
      place: 'Gymnase A',
      type: 'Entrainement',
      name: 'Entraînement du mardi',
      description: 'Séance classique',
      group: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['date', 'place', 'type', 'name', 'description', 'group']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse un type invalide', async () => {
      await assert.rejects(
        col.insertOne({ ...valid(), type: 'Apéro' }),
        /Document failed validation/,
      );
    });

    it('refuse le doublon (même event complet)', async () => {
      const doc = { ...valid(), group: new ObjectId() };
      await col.insertOne(doc);
      await assert.rejects(col.insertOne(doc), /duplicate key/);
    });
  });

  describe('match', () => {
    let col;
    before(() => {
      col = database.collection('match');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ event: new ObjectId(), opponent: 'Équipe B' }));
    });

    it('refuse sans event', async () => {
      await assert.rejects(col.insertOne({ opponent: 'Équipe B' }), /Document failed validation/);
    });

    it('refuse sans opponent', async () => {
      await assert.rejects(col.insertOne({ event: new ObjectId() }), /Document failed validation/);
    });

    it('refuse le doublon event+opponent', async () => {
      const event = new ObjectId();
      await col.insertOne({ event, opponent: 'Équipe B' });
      await assert.rejects(col.insertOne({ event, opponent: 'Équipe B' }), /duplicate key/);
    });
  });

  describe('set', () => {
    let col;
    before(() => {
      col = database.collection('set');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ number: 1, match: new ObjectId() }));
    });

    it('refuse sans number', async () => {
      await assert.rejects(col.insertOne({ match: new ObjectId() }), /Document failed validation/);
    });

    it('refuse sans match', async () => {
      await assert.rejects(col.insertOne({ number: 1 }), /Document failed validation/);
    });

    it('refuse le doublon number+match', async () => {
      const match = new ObjectId();
      await col.insertOne({ number: 1, match });
      await assert.rejects(col.insertOne({ number: 1, match }), /duplicate key/);
    });
  });

  describe('team', () => {
    let col;
    before(() => {
      col = database.collection('team');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ name: 'Équipe A', leader: new ObjectId() }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(col.insertOne({ leader: new ObjectId() }), /Document failed validation/);
    });

    it('refuse sans leader', async () => {
      await assert.rejects(col.insertOne({ name: 'Équipe A' }), /Document failed validation/);
    });

    it('refuse le doublon name+leader', async () => {
      const leader = new ObjectId();
      await col.insertOne({ name: 'Équipe A', leader });
      await assert.rejects(col.insertOne({ name: 'Équipe A', leader }), /duplicate key/);
    });
  });

  describe('group', () => {
    let col;
    before(() => {
      col = database.collection('group');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      name: 'U18',
      created_at: new Date('2024-01-01'),
      owner: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['name', 'created_at', 'owner']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }
  });

  describe('message', () => {
    let col;
    before(() => {
      col = database.collection('message');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      group: new ObjectId(),
      user: new ObjectId(),
      date: new Date(),
      body: 'Salut !',
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['group', 'user', 'date', 'body']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }
  });

  describe('participant', () => {
    let col;
    before(() => {
      col = database.collection('participant');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ user: new ObjectId(), event: new ObjectId() }));
    });

    it('refuse le doublon user+event', async () => {
      const user = new ObjectId();
      const event = new ObjectId();
      await col.insertOne({ user, event });
      await assert.rejects(col.insertOne({ user, event }), /duplicate key/);
    });

    it('autorise le même user sur deux événements différents', async () => {
      const user = new ObjectId();
      await col.insertOne({ user, event: new ObjectId() });
      await assert.doesNotReject(col.insertOne({ user, event: new ObjectId() }));
    });
  });

  describe('group_member', () => {
    let col;
    before(() => {
      col = database.collection('group_member');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ group: new ObjectId(), user: new ObjectId() }));
    });

    it('refuse le doublon group+user', async () => {
      const group = new ObjectId();
      const user = new ObjectId();
      await col.insertOne({ group, user });
      await assert.rejects(col.insertOne({ group, user }), /duplicate key/);
    });
  });

  describe('referee', () => {
    let col;
    before(() => {
      col = database.collection('referee');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ user: new ObjectId(), match: new ObjectId() }));
    });

    it('refuse le doublon user+match', async () => {
      const user = new ObjectId();
      const match = new ObjectId();
      await col.insertOne({ user, match });
      await assert.rejects(col.insertOne({ user, match }), /duplicate key/);
    });
  });

  describe('player_position', () => {
    let col;
    before(() => {
      col = database.collection('player_position');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      player: new ObjectId(),
      set: new ObjectId(),
      position: new ObjectId(),
      nbOut: 1,
      nbIn: 0,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['player', 'set', 'position', 'nbOut', 'nbIn']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse le doublon player+set+position', async () => {
      const player = new ObjectId();
      const set = new ObjectId();
      const position = new ObjectId();
      await col.insertOne({ player, set, position, nbOut: 1, nbIn: 0 });
      await assert.rejects(
        col.insertOne({ player, set, position, nbOut: 0, nbIn: 1 }),
        /duplicate key/,
      );
    });
  });
});
