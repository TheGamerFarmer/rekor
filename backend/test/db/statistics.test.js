const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');
const Statistic = require('../../db/models/statistic');
const Operation = require('../../db/models/operation');
const UserStat = require('../../db/models/user_stat');
const TeamStat = require('../../db/models/team_stat');
const StatisticCategory = require('../../db/models/statistic_category');
const Position = require('../../db/models/position');
const Category = require('../../db/models/category');

describe('collections statistiques', () => {
  let mongod;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
  });
  after(() => teardown(mongod));

  describe('statistic', () => {
    beforeEach(() => Statistic.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Statistic.create({ name: 'Passes décisives' }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(Statistic.create({}), /ValidationError/);
    });
  });

  describe('operation', () => {
    beforeEach(() => Operation.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Operation.create({ name: 'Moyenne', formula: 'sum / count' }));
    });

    for (const field of ['name', 'formula']) {
      it(`refuse sans ${field}`, async () => {
        const doc = { name: 'Moyenne', formula: 'sum / count' };
        delete doc[field];
        await assert.rejects(Operation.create(doc), /ValidationError/);
      });
    }

    it('name doit être unique', async () => {
      await Operation.create({ name: 'Moyenne', formula: 'sum / count' });
      await assert.rejects(
        Operation.create({ name: 'Moyenne', formula: 'autre' }),
        /duplicate key/,
      );
    });
  });

  describe('user_stat', () => {
    beforeEach(() => UserStat.deleteMany({}));

    const valid = () => ({
      statistic: new ObjectId(),
      set: new ObjectId(),
      value: 3,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(UserStat.create(valid()));
    });

    for (const field of ['statistic', 'set', 'value']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(UserStat.create(doc), /ValidationError/);
      });
    }

    it('refuse le doublon statistic+created_by+set', async () => {
      const statistic = new ObjectId();
      const set = new ObjectId();
      await UserStat.create({ statistic, set, value: 3 });
      await assert.rejects(UserStat.create({ statistic, set, value: 5 }), /duplicate key/);
    });
  });

  describe('team_stat', () => {
    beforeEach(() => TeamStat.deleteMany({}));

    const valid = () => ({
      statistic: new ObjectId(),
      team: new ObjectId(),
      set: new ObjectId(),
      value: 10,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(TeamStat.create(valid()));
    });

    for (const field of ['statistic', 'team', 'set', 'value']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(TeamStat.create(doc), /ValidationError/);
      });
    }

    it('refuse le doublon statistic+team+set', async () => {
      const statistic = new ObjectId();
      const team = new ObjectId();
      const set = new ObjectId();
      await TeamStat.create({ statistic, team, set, value: 10 });
      await assert.rejects(TeamStat.create({ statistic, team, set, value: 20 }), /duplicate key/);
    });
  });

  describe('statistic_category', () => {
    beforeEach(() => StatisticCategory.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        StatisticCategory.create({ statistic: new ObjectId(), category: new ObjectId() }),
      );
    });

    it('refuse le doublon statistic+category', async () => {
      const statistic = new ObjectId();
      const category = new ObjectId();
      await StatisticCategory.create({ statistic, category });
      await assert.rejects(StatisticCategory.create({ statistic, category }), /duplicate key/);
    });
  });

  describe('position', () => {
    beforeEach(() => Position.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Position.create({ name: 'Libéro' }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(Position.create({}), /ValidationError/);
    });

    it('name doit être unique', async () => {
      await Position.create({ name: 'Libéro' });
      await assert.rejects(Position.create({ name: 'Libéro' }), /duplicate key/);
    });
  });

  describe('category', () => {
    beforeEach(() => Category.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Category.create({ name: 'Attaque' }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(Category.create({}), /ValidationError/);
    });

    it('name doit être unique', async () => {
      await Category.create({ name: 'Attaque' });
      await assert.rejects(Category.create({ name: 'Attaque' }), /duplicate key/);
    });
  });
});
