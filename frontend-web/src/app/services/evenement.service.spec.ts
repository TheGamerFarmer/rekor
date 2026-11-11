import { EvenementService } from './evenement.service';
import {
  defaultEvenements,
  type Evenement,
} from '../components/component-evenement/evenements.data';

const eventValues: Omit<Evenement, 'id' | 'slug'> = {
  name: 'Événement spécial',
  type: 'Autre',
  date: '2026-12-20',
  time: '14:00',
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

    localStorage.setItem('rekor-evenements', JSON.stringify({ invalid: true }));
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);

    localStorage.setItem('rekor-evenements', '{invalid');
    expect(new EvenementService().evenements()).toEqual(defaultEvenements);
  });

  it('adds events with normalized unique slugs and persists them', () => {
    const service = new EvenementService();

    service.add(eventValues);
    service.add(eventValues);

    expect(service.evenements().at(-2)).toMatchObject({
      id: 8,
      slug: 'evenement-special',
    });
    expect(service.evenements().at(-1)).toMatchObject({
      id: 9,
      slug: 'evenement-special-9',
    });
    expect(JSON.parse(localStorage.getItem('rekor-evenements') ?? '')).toEqual(
      service.evenements(),
    );
  });

  it('updates, finds, and removes events', () => {
    const service = new EvenementService();

    service.update('entrainement-2026-11-17', {
      ...eventValues,
      name: 'Entraînement modifié',
    });
    expect(service.findBySlug('entrainement-2026-11-17')?.name).toBe('Entraînement modifié');

    service.update('unknown-event', eventValues);
    service.remove(4);

    expect(service.findBySlug('entrainement-2026-11-17')).toBeUndefined();
    expect(service.evenements()).toHaveLength(defaultEvenements.length - 1);
  });
});
