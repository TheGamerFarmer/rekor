const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');

describe('collections association', () => {
  let mongod, database;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
    database = res.database;
  });
  after(() => teardown(mongod));

  describe('association', () => {
    let col;
    before(() => {
      col = database.collection('association');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        col.insertOne({ name: 'Club Tennis', address: '1 rue de la Paix' }),
      );
    });

    for (const field of ['name', 'address']) {
      it(`refuse sans ${field}`, async () => {
        const doc = { name: 'Club Tennis', address: '1 rue de la Paix' };
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse le doublon name+address', async () => {
      await col.insertOne({ name: 'Club Tennis', address: '1 rue de la Paix' });
      await assert.rejects(
        col.insertOne({ name: 'Club Tennis', address: '1 rue de la Paix' }),
        /duplicate key/,
      );
    });

    it('autorise le même nom avec une adresse différente', async () => {
      await col.insertOne({ name: 'Club Tennis', address: '1 rue de la Paix' });
      await assert.doesNotReject(
        col.insertOne({ name: 'Club Tennis', address: '2 avenue des Sports' }),
      );
    });
  });

  describe('registration', () => {
    let col;
    before(() => {
      col = database.collection('registration');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({ association: new ObjectId(), user: new ObjectId(), date: new Date() });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    it('refuse le doublon association+user+date', async () => {
      const association = new ObjectId();
      const user = new ObjectId();
      const date = new Date('2024-01-01');
      await col.insertOne({ association, user, date });
      await assert.rejects(col.insertOne({ association, user, date }), /duplicate key/);
    });
  });

  describe('document', () => {
    let col;
    before(() => {
      col = database.collection('document');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      fileName: 'contrat.pdf',
      type: 'Facture',
      uploadDate: new Date(),
      association: new ObjectId(),
      user: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['fileName', 'type', 'uploadDate', 'association', 'user']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse un type invalide', async () => {
      await assert.rejects(
        col.insertOne({ ...valid(), type: 'PhotoDeVacances' }),
        /Document failed validation/,
      );
    });

    it('fileName doit être unique', async () => {
      await col.insertOne(valid());
      await assert.rejects(col.insertOne(valid()), /duplicate key/);
    });
  });

  describe('bank_operation', () => {
    let col;
    before(() => {
      col = database.collection('bank_operation');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({ amount: 99.9, comment: 'achat maillots', date: new Date() });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['amount', 'comment', 'date']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }
  });

  describe('bank_operation_document', () => {
    let col;
    before(() => {
      col = database.collection('bank_operation_document');
    });
    beforeEach(() => col.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        col.insertOne({ document: new ObjectId(), bankOperation: new ObjectId() }),
      );
    });

    it('refuse le doublon document+bankOperation', async () => {
      const document = new ObjectId();
      const bankOperation = new ObjectId();
      await col.insertOne({ document, bankOperation });
      await assert.rejects(col.insertOne({ document, bankOperation }), /duplicate key/);
    });
  });

  describe('publication', () => {
    let col;
    before(() => {
      col = database.collection('publication');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({
      title: 'Tournoi',
      body: 'Infos...',
      date: new Date('2024-06-01'),
      association: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['title', 'body', 'date', 'association']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }
  });

  describe('media', () => {
    let col;
    before(() => {
      col = database.collection('media');
    });
    beforeEach(() => col.deleteMany({}));

    const valid = () => ({ name: 'photo.jpg', type: 'Image', publication: new ObjectId() });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(col.insertOne(valid()));
    });

    for (const field of ['name', 'type', 'publication']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(col.insertOne(doc), /Document failed validation/);
      });
    }

    it('refuse un type invalide', async () => {
      await assert.rejects(
        col.insertOne({ ...valid(), type: 'Audio' }),
        /Document failed validation/,
      );
    });
  });
});
