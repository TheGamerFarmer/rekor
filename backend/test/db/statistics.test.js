const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');

describe('collections statistiques', () => {
  let mongod, database;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
    database = res.database;
  });
  after(() => teardown(mongod));

  describe('statistic', () => {
    let col;
    before(() => {
      col = database.collection('statistic');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ name: 'Passes décisives' }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(col.insertOne({}), /Document failed validation/);
    });
  });

  describe('operation', () => {
    let col;
    before(() => {
      col = database.collection('operation');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ name: 'Moyenne', formula: 'sum / count' }));
    });

    for (const field of ['name', 'formula']) {
      it(`refuse sans ${field}`, async () => {
        const doc = { name: 'Moyenne', formula: 'sum / count' };
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('name doit être unique', async () => {
      await col.insertOne({ name: 'Moyenne', formula: 'sum / count' });
      await assert.rejects(col.insertOne({ name: 'Moyenne', formula: 'autre' }), /duplicate key/);
    });
  });

  describe('user_stat', () => {
    let col;
    before(() => {
      col = database.collection('user_stat');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      statistic: new ObjectId(),
      player: new ObjectId(),
      set: new ObjectId(),
      value: 3,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['statistic', 'player', 'set', 'value']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse le doublon statistic+player+set', async () => {
      const statistic = new ObjectId();
      const player = new ObjectId();
      const set = new ObjectId();
      await col.insertOne({ statistic, player, set, value: 3 });
      await assert.rejects(col.insertOne({ statistic, player, set, value: 5 }), /duplicate key/);
    });
  });

  describe('team_stat', () => {
    let col;
    before(() => {
      col = database.collection('team_stat');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      statistic: new ObjectId(),
      team: new ObjectId(),
      set: new ObjectId(),
      value: 10,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['statistic', 'team', 'set', 'value']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse le doublon statistic+team+set', async () => {
      const statistic = new ObjectId();
      const team = new ObjectId();
      const set = new ObjectId();
      await col.insertOne({ statistic, team, set, value: 10 });
      await assert.rejects(col.insertOne({ statistic, team, set, value: 20 }), /duplicate key/);
    });
  });

  describe('statistic_category', () => {
    let col;
    before(() => {
      col = database.collection('statistic_category');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        col.insertOne({ statistic: new ObjectId(), category: new ObjectId() }),
      );
    });

    it('refuse le doublon statistic+category', async () => {
      const statistic = new ObjectId();
      const category = new ObjectId();
      await col.insertOne({ statistic, category });
      await assert.rejects(col.insertOne({ statistic, category }), /duplicate key/);
    });
  });

  describe('position', () => {
    let col;
    before(() => {
      col = database.collection('position');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ name: 'Libéro' }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(col.insertOne({}), /Document failed validation/);
    });

    it('name doit être unique', async () => {
      await col.insertOne({ name: 'Libéro' });
      await assert.rejects(col.insertOne({ name: 'Libéro' }), /duplicate key/);
    });
  });

  describe('category', () => {
    let col;
    before(() => {
      col = database.collection('category');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ name: 'Attaque' }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(col.insertOne({}), /Document failed validation/);
    });

    it('name doit être unique', async () => {
      await col.insertOne({ name: 'Attaque' });
      await assert.rejects(col.insertOne({ name: 'Attaque' }), /duplicate key/);
    });
  });
});
