const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');
const Carpool = require('../../db/models/carpool');
const Carpooler = require('../../db/models/carpooler');
const CarpoolPayment = require('../../db/models/carpool_payment');

describe('collections covoiturage', () => {
  let mongod;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
  });
  after(() => teardown(mongod));

  describe('carpool', () => {
    beforeEach(() => Carpool.deleteMany({}));

    const valid = () => ({ maxSeats: 4, electric: false, group: new ObjectId() });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Carpool.create(valid()));
    });

    for (const field of ['maxSeats', 'electric', 'group']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Carpool.create(doc), /ValidationError/);
      });
    }
  });

  describe('carpooler', () => {
    beforeEach(() => Carpooler.deleteMany({}));

    const valid = () => ({ carpool: new ObjectId(), takenSeats: 2 });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Carpooler.create(valid()));
    });

    for (const field of ['carpool', 'takenSeats']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Carpooler.create(doc), /ValidationError/);
      });
    }

    it('refuse le doublon created_by+carpool', async () => {
      const carpool = new ObjectId();
      await Carpooler.create({ carpool, takenSeats: 1 });
      await assert.rejects(Carpooler.create({ carpool, takenSeats: 2 }), /duplicate key/);
    });
  });

  describe('carpool_payment', () => {
    beforeEach(() => CarpoolPayment.deleteMany({}));

    const valid = () => ({
      carpool: new ObjectId(),
      amount: 10.5,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(CarpoolPayment.create(valid()));
    });

    for (const field of ['carpool', 'amount']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(CarpoolPayment.create(doc), /ValidationError/);
      });
    }
  });
});
