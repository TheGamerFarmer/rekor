const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');
const Association = require('../../db/models/association');
const Registration = require('../../db/models/registration');
const Document = require('../../db/models/document');
const BankOperation = require('../../db/models/bank_operation');
const BankOperationDocument = require('../../db/models/bank_operation_document');
const Publication = require('../../db/models/publication');
const Media = require('../../db/models/media');

describe('collections association', () => {
  let mongod;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
  });
  after(() => teardown(mongod));

  describe('association', () => {
    beforeEach(() => Association.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        Association.create({ name: 'Club Tennis', address: '1 rue de la Paix' }),
      );
    });

    for (const field of ['name', 'address']) {
      it(`refuse sans ${field}`, async () => {
        const doc = { name: 'Club Tennis', address: '1 rue de la Paix' };
        delete doc[field];
        await assert.rejects(Association.create(doc), /ValidationError/);
      });
    }

    it('refuse le doublon name+address', async () => {
      await Association.create({ name: 'Club Tennis', address: '1 rue de la Paix' });
      await assert.rejects(
        Association.create({ name: 'Club Tennis', address: '1 rue de la Paix' }),
        /duplicate key/,
      );
    });

    it('autorise le même nom avec une adresse différente', async () => {
      await Association.create({ name: 'Club Tennis', address: '1 rue de la Paix' });
      await assert.doesNotReject(
        Association.create({ name: 'Club Tennis', address: '2 avenue des Sports' }),
      );
    });
  });

  describe('registration', () => {
    beforeEach(() => Registration.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Registration.create({ association: new ObjectId() }));
    });
  });

  describe('document', () => {
    beforeEach(() => Document.deleteMany({}));

    const valid = () => ({
      fileName: 'contrat.pdf',
      type: 'Facture',
      association: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Document.create(valid()));
    });

    for (const field of ['fileName', 'type', 'association']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Document.create(doc), /ValidationError/);
      });
    }

    it('refuse un type invalide', async () => {
      await assert.rejects(
        Document.create({ ...valid(), type: 'PhotoDeVacances' }),
        /ValidationError/,
      );
    });

    it('fileName doit être unique', async () => {
      await Document.create(valid());
      await assert.rejects(Document.create(valid()), /duplicate key/);
    });
  });

  describe('bank_operation', () => {
    beforeEach(() => BankOperation.deleteMany({}));

    const valid = () => ({ amount: 99.9, comment: 'achat maillots', date: new Date() });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(BankOperation.create(valid()));
    });

    for (const field of ['amount', 'comment', 'date']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(BankOperation.create(doc), /ValidationError/);
      });
    }
  });

  describe('bank_operation_document', () => {
    beforeEach(() => BankOperationDocument.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        BankOperationDocument.create({ document: new ObjectId(), bankOperation: new ObjectId() }),
      );
    });

    it('refuse le doublon document+bankOperation', async () => {
      const document = new ObjectId();
      const bankOperation = new ObjectId();
      await BankOperationDocument.create({ document, bankOperation });
      await assert.rejects(
        BankOperationDocument.create({ document, bankOperation }),
        /duplicate key/,
      );
    });
  });

  describe('publication', () => {
    beforeEach(() => Publication.deleteMany({}));

    const valid = () => ({
      title: 'Tournoi',
      body: 'Infos...',
      association: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Publication.create(valid()));
    });

    for (const field of ['title', 'body', 'association']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Publication.create(doc), /ValidationError/);
      });
    }
  });

  describe('media', () => {
    beforeEach(() => Media.deleteMany({}));

    const valid = () => ({ name: 'photo.jpg', type: 'Image', publication: new ObjectId() });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Media.create(valid()));
    });

    for (const field of ['name', 'type', 'publication']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Media.create(doc), /ValidationError/);
      });
    }

    it('refuse un type invalide', async () => {
      await assert.rejects(Media.create({ ...valid(), type: 'Audio' }), /ValidationError/);
    });
  });
});
