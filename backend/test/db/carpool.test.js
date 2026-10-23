const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');

describe('collections covoiturage', () => {
  let mongod, database;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
    database = res.database;
  });
  after(() => teardown(mongod));

  describe('carpool', () => {
    let col;
    before(() => {
      col = database.collection('carpool');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = { maxSeats: 4, electric: false, group: new ObjectId() };

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne({ ...valid }));
    });

    for (const field of ['maxSeats', 'electric', 'group']) {
      it(`refuse sans ${field}`, async () => {
        const doc = { ...valid };
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }
  });

  describe('carpooler', () => {
    let col;
    before(() => {
      col = database.collection('carpooler');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({ user: new ObjectId(), carpool: new ObjectId(), takenSeats: 2 });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['user', 'carpool', 'takenSeats']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse le doublon user+carpool', async () => {
      const user = new ObjectId();
      const carpool = new ObjectId();
      await col.insertOne({ user, carpool, takenSeats: 1 });
      await assert.rejects(col.insertOne({ user, carpool, takenSeats: 2 }), /duplicate key/);
    });
  });

  describe('carpool_payment', () => {
    let col;
    before(() => {
      col = database.collection('carpool_payment');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      user: new ObjectId(),
      carpool: new ObjectId(),
      date: new Date(),
      amount: 10.5,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['user', 'carpool', 'date', 'amount']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }
  });
});
