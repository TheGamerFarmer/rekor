import { AdherentService, type Adherent, type AdherentInput } from './adherent.service';

const STORAGE_KEY = 'rekor-adherents';

const member: Adherent = {
  id: 4,
  lastName: 'Martin',
  firstName: 'Alex',
  pronoun: 'Iel',
  birthDate: '2000-05-12',
  phone: '0600000000',
  email: 'alex@example.fr',
  role: 'Adhérent',
  registrationStatus: 'validated',
};

const memberInput: AdherentInput = {
  lastName: member.lastName,
  firstName: member.firstName,
  pronoun: member.pronoun,
  birthDate: member.birthDate,
  phone: member.phone,
  email: member.email,
  role: member.role,
  registrationStatus: member.registrationStatus,
};

describe('AdherentService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with mock members when storage is empty', () => {
    const members = new AdherentService().adherents();

    expect(members).toHaveLength(5);
    expect(members.map(({ registrationStatus }) => registrationStatus)).toContain('validated');
    expect(members.map(({ registrationStatus }) => registrationStatus)).toContain(
      'pending-validation',
    );
    expect(members.map(({ registrationStatus }) => registrationStatus)).toContain('to-validate');
    expect(members.some(({ birthDate }) => birthDate === null)).toBe(true);
  });

  it('loads stored members and migrates legacy birth years', () => {
    const legacyMember = { ...member, birthYear: 2000 };
    delete (legacyMember as Partial<typeof legacyMember>).birthDate;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([legacyMember]));

    expect(new AdherentService().adherents()).toEqual([{ ...member, birthDate: null }]);
  });

  it('ignores malformed or invalid stored members', () => {
    for (const stored of [
      '{invalid',
      JSON.stringify({ member }),
      JSON.stringify([null]),
      JSON.stringify(['invalid']),
      JSON.stringify([{ ...member, pronoun: 'Unknown' }]),
      JSON.stringify([{ ...member, birthDate: 2000 }]),
      JSON.stringify([{ ...member, phone: null }]),
      JSON.stringify([{ ...member, role: '' }]),
      JSON.stringify([{ ...member, registrationStatus: 'unknown' }]),
      JSON.stringify([{ ...member, id: '4' }]),
    ]) {
      localStorage.setItem(STORAGE_KEY, stored);
      expect(new AdherentService().adherents()).toEqual([]);
    }
  });

  it('adds members with a new identifier and persists their role', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([member]));
    const service = new AdherentService();
    service.add(memberInput);

    expect(service.adherents()).toHaveLength(2);
    expect(service.adherents()[1]).toEqual({ ...memberInput, id: 5 });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(service.adherents());
  });

  it('updates only the matching member while preserving its identifier', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const service = new AdherentService();
    service.add(memberInput);
    service.update(1, { ...memberInput, firstName: 'Alexandre', role: 'Capitaine' });
    service.update(99, memberInput);

    expect(service.adherents()).toEqual([
      { ...memberInput, id: 1, firstName: 'Alexandre', role: 'Capitaine' },
    ]);
  });

  it('migrates multiple legacy roles to the highest role and normalizes coach spelling', () => {
    const { role, ...rest } = member;
    void role;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { ...rest, roles: ['Adhérent', 'Capitaine'] },
        { ...rest, id: 5, roles: ['Entraîneur', 'Visiteur'] },
      ]),
    );
    expect(new AdherentService().adherents()).toEqual([
      { ...rest, role: 'Capitaine' },
      { ...rest, id: 5, role: 'Entraineur' },
    ]);
  });

  it('preserves new roles without requiring a frontend update', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...member, role: 'Arbitre' }]));
    expect(new AdherentService().adherents()[0].role).toBe('Arbitre');
  });

  it('removes matching members and persists even when no member matches', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const service = new AdherentService();
    service.add(memberInput);
    service.add(memberInput);

    service.remove(1);
    expect(service.adherents()).toHaveLength(1);
    service.remove(99);

    expect(service.adherents()).toEqual([{ ...memberInput, id: 2 }]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(service.adherents());
  });

  it('does not access storage when localStorage is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });

    try {
      const service = new AdherentService();
      expect(service.adherents()).toEqual([]);
      expect(() => service.add(memberInput)).not.toThrow();
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, 'localStorage', descriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'localStorage');
      }
    }
  });
});
