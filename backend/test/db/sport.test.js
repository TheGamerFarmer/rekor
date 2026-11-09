const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');
const Event = require('../../db/models/event');
const Match = require('../../db/models/match');
const GameSet = require('../../db/models/game_set');
const Team = require('../../db/models/team');
const Group = require('../../db/models/group');
const Message = require('../../db/models/message');
const Participant = require('../../db/models/participant');
const GroupMember = require('../../db/models/group_member');
const Referee = require('../../db/models/referee');
const PlayerPosition = require('../../db/models/player_position');

describe('collections sport', () => {
  let mongod;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
  });
  after(() => teardown(mongod));

  describe('event', () => {
    beforeEach(() => Event.deleteMany({}));

    const valid = () => ({
      date: new Date('2024-06-01'),
      place: 'Gymnase A',
      type: 'Entrainement',
      name: 'Entraînement du mardi',
      description: 'Séance classique',
      group: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Event.create(valid()));
    });

    for (const field of ['date', 'place', 'type', 'name', 'description', 'group']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Event.create(doc), /ValidationError/);
      });
    }

    it('refuse un type invalide', async () => {
      await assert.rejects(Event.create({ ...valid(), type: 'Apéro' }), /ValidationError/);
    });

    it('refuse le doublon (même event complet)', async () => {
      const doc = { ...valid(), group: new ObjectId() };
      await Event.create(doc);
      await assert.rejects(Event.create(doc), /duplicate key/);
    });
  });

  describe('match', () => {
    beforeEach(() => Match.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Match.create({ event: new ObjectId(), opponent: 'Équipe B' }));
    });

    it('refuse sans event', async () => {
      await assert.rejects(Match.create({ opponent: 'Équipe B' }), /ValidationError/);
    });

    it('refuse sans opponent', async () => {
      await assert.rejects(Match.create({ event: new ObjectId() }), /ValidationError/);
    });

    it('refuse le doublon event+opponent', async () => {
      const event = new ObjectId();
      await Match.create({ event, opponent: 'Équipe B' });
      await assert.rejects(Match.create({ event, opponent: 'Équipe B' }), /duplicate key/);
    });
  });

  describe('set', () => {
    beforeEach(() => GameSet.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(GameSet.create({ number: 1, match: new ObjectId() }));
    });

    it('refuse sans number', async () => {
      await assert.rejects(GameSet.create({ match: new ObjectId() }), /ValidationError/);
    });

    it('refuse sans match', async () => {
      await assert.rejects(GameSet.create({ number: 1 }), /ValidationError/);
    });

    it('refuse le doublon number+match', async () => {
      const match = new ObjectId();
      await GameSet.create({ number: 1, match });
      await assert.rejects(GameSet.create({ number: 1, match }), /duplicate key/);
    });
  });

  describe('team', () => {
    beforeEach(() => Team.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Team.create({ name: 'Équipe A', leader: new ObjectId() }));
    });

    it('refuse sans name', async () => {
      await assert.rejects(Team.create({ leader: new ObjectId() }), /ValidationError/);
    });

    it('refuse sans leader', async () => {
      await assert.rejects(Team.create({ name: 'Équipe A' }), /ValidationError/);
    });

    it('refuse le doublon name+leader', async () => {
      const leader = new ObjectId();
      await Team.create({ name: 'Équipe A', leader });
      await assert.rejects(Team.create({ name: 'Équipe A', leader }), /duplicate key/);
    });
  });

  describe('group', () => {
    beforeEach(() => Group.deleteMany({}));

    const valid = () => ({
      name: 'U18',
      owner: new ObjectId(),
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Group.create(valid()));
    });

    for (const field of ['name', 'owner']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Group.create(doc), /ValidationError/);
      });
    }
  });

  describe('message', () => {
    beforeEach(() => Message.deleteMany({}));

    const valid = () => ({
      group: new ObjectId(),
      body: 'Salut !',
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Message.create(valid()));
    });

    for (const field of ['group', 'body']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(Message.create(doc), /ValidationError/);
      });
    }
  });

  describe('participant', () => {
    beforeEach(() => Participant.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        Participant.create({ user: new ObjectId(), event: new ObjectId() }),
      );
    });

    it('refuse le doublon user+event', async () => {
      const user = new ObjectId();
      const event = new ObjectId();
      await Participant.create({ user, event });
      await assert.rejects(Participant.create({ user, event }), /duplicate key/);
    });

    it('autorise le même user sur deux événements différents', async () => {
      const user = new ObjectId();
      await Participant.create({ user, event: new ObjectId() });
      await assert.doesNotReject(Participant.create({ user, event: new ObjectId() }));
    });
  });

  describe('group_member', () => {
    beforeEach(() => GroupMember.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(
        GroupMember.create({ group: new ObjectId(), user: new ObjectId() }),
      );
    });

    it('refuse le doublon group+user', async () => {
      const group = new ObjectId();
      const user = new ObjectId();
      await GroupMember.create({ group, user });
      await assert.rejects(GroupMember.create({ group, user }), /duplicate key/);
    });
  });

  describe('referee', () => {
    beforeEach(() => Referee.deleteMany({}));

    it('accepte un document valide', async () => {
      await assert.doesNotReject(Referee.create({ user: new ObjectId(), match: new ObjectId() }));
    });

    it('refuse le doublon user+match', async () => {
      const user = new ObjectId();
      const match = new ObjectId();
      await Referee.create({ user, match });
      await assert.rejects(Referee.create({ user, match }), /duplicate key/);
    });
  });

  describe('player_position', () => {
    beforeEach(() => PlayerPosition.deleteMany({}));

    const valid = () => ({
      player: new ObjectId(),
      set: new ObjectId(),
      position: new ObjectId(),
      nbOut: 1,
      nbIn: 0,
    });

    it('accepte un document valide', async () => {
      await assert.doesNotReject(PlayerPosition.create(valid()));
    });

    for (const field of ['player', 'set', 'position', 'nbOut', 'nbIn']) {
      it(`refuse sans ${field}`, async () => {
        const doc = valid();
        delete doc[field];
        await assert.rejects(PlayerPosition.create(doc), /ValidationError/);
      });
    }

    it('refuse le doublon player+set+position', async () => {
      const player = new ObjectId();
      const set = new ObjectId();
      const position = new ObjectId();
      await PlayerPosition.create({ player, set, position, nbOut: 1, nbIn: 0 });
      await assert.rejects(
        PlayerPosition.create({ player, set, position, nbOut: 0, nbIn: 1 }),
        /duplicate key/,
      );
    });
  });
});
