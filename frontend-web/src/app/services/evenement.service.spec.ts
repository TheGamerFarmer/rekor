import { EvenementService } from './evenement.service';
import {
  defaultEvenements,
  type Evenement,
} from '../components/component-evenement/evenements.data';

const eventValues: Omit<Evenement, 'id'> = {
  name: 'Événement spécial',
  type: 'Autre',
  date: '2026-12-20T14:00',
  place: 'Gymnase test, 1 Rue Test, Gières',
  description: 'Description test',
  group: 'Tous',
};

describe('EvenementService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads the default events when storage is empty', () => {
    const service = new EvenementService();

    expect(service.evenements()).toEqual(defaultEvenements);
  });

  it('loads valid events and rejects malformed stored data', () => {
    const storedEvent = { ...defaultEvenements[0] };
    localStorage.setItem('rekor-evenements', JSON.stringify([storedEvent]));
    expect(new EvenementService().evenements()).toEqual([storedEvent]);

    localStorage.setItem('rekor-evenements', JSON.stringify([null]));
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);

    localStorage.setItem('rekor-evenements', JSON.stringify(['invalid']));
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);

    localStorage.setItem(
      'rekor-evenements',
      JSON.stringify([
        { ...storedEvent, participants: [{ id: 1, name: 'Joueur', status: 'unknown' }] },
      ]),
    );
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);

    localStorage.setItem('rekor-evenements', JSON.stringify({ invalid: true }));
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);

    localStorage.setItem('rekor-evenements', '{invalid');
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);
  });

  it('migrates legacy event times into the date field', () => {
    const legacyEvent = {
      ...defaultEvenements[0],
      date: '2026-10-10',
      time: '18:00',
    };
    localStorage.setItem('rekor-evenements', JSON.stringify([legacyEvent]));

    const event = new EvenementService().evenements()[0];

    expect(event.date).toBe('2026-10-10T18:00');
    expect(event).not.toHaveProperty('time');
  });

  it('adds events with unique IDs and persists them', () => {
    const service = new EvenementService();

    service.add(eventValues);
    service.add(eventValues);

    expect(service.evenements().at(-2)).toMatchObject({
      id: 8,
    });
    expect(service.evenements().at(-1)).toMatchObject({
      id: 9,
    });
    expect(JSON.parse(localStorage.getItem('rekor-evenements') ?? '')).toEqual(
      service.evenements(),
    );
  });

  it('updates, finds, and removes events', () => {
    const service = new EvenementService();

    service.update(4, {
      ...eventValues,
      name: 'Entraînement modifié',
    });
    expect(service.findById(4)?.name).toBe('Entraînement modifié');

    service.update(999, eventValues);
    service.remove(4);

    expect(service.findById(4)).toBeUndefined();
    expect(service.evenements()).toHaveLength(defaultEvenements.length - 1);
  });
});
