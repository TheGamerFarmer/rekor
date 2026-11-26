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
  registrationStatus: 'finalized',
  medicalCertificate: true,
  medicalCertificateReceivedDate: null,
  membershipPaymentDate: null,
  rightOfPublicity: false,
};

const memberInput: AdherentInput = {
  lastName: member.lastName,
  firstName: member.firstName,
  pronoun: member.pronoun,
  birthDate: member.birthDate,
  phone: member.phone,
  email: member.email,
  role: member.role,
  registrationStatus: 'pending',
};

describe('AdherentService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with mock members when storage is empty', () => {
    const members = new AdherentService().adherents();

    expect(members).toHaveLength(6);
    expect(members.map(({ registrationStatus }) => registrationStatus)).toContain('finalized');
    expect(members.map(({ registrationStatus }) => registrationStatus)).toContain('validated');
    expect(members.map(({ registrationStatus }) => registrationStatus)).toContain('pending');
    expect(members.some(({ birthDate }) => birthDate === null)).toBe(true);
  });

  it('loads stored members and migrates legacy birth years', () => {
    const legacyMember = { ...member, birthYear: 2000 };
    delete (legacyMember as Partial<typeof legacyMember>).birthDate;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([legacyMember]));

    expect(new AdherentService().adherents()).toEqual([{ ...member, birthDate: null }]);
  });

  it('migrates legacy registration status values', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        member,
        { ...member, id: 5, registrationStatus: 'pending-validation' },
        { ...member, id: 6, registrationStatus: 'to-validate' },
      ]),
    );

    expect(
      new AdherentService().adherents().map(({ registrationStatus }) => registrationStatus),
    ).toEqual(['finalized', 'validated', 'pending']);
  });

  it('marks missing legacy consents as unknown without changing known values', () => {
    const legacyMember = {
      ...memberInput,
      id: 4,
      registrationStatus: 'finalized' as const,
      medicalCertificateReceivedDate: null,
      membershipPaymentDate: null,
    };
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValueOnce(
        JSON.stringify([
          legacyMember,
          { ...legacyMember, id: 5, medicalCertificate: true },
          { ...legacyMember, id: 6, medicalCertificate: false, rightOfPublicity: false },
        ]),
      );

    try {
      expect(new AdherentService().adherents()).toEqual([
        { ...legacyMember, medicalCertificate: null, rightOfPublicity: null },
        { ...legacyMember, id: 5, medicalCertificate: true, rightOfPublicity: null },
        { ...legacyMember, id: 6, medicalCertificate: false, rightOfPublicity: false },
      ]);
      expect(getItem).toHaveBeenCalledWith(STORAGE_KEY);
    } finally {
      getItem.mockRestore();
    }
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
      JSON.stringify([{ ...member, medicalCertificate: 'true' }]),
      JSON.stringify([{ ...member, rightOfPublicity: 'false' }]),
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
    expect(service.adherents()[1]).toEqual({
      ...memberInput,
      id: 5,
      medicalCertificate: null,
      medicalCertificateReceivedDate: null,
      membershipPaymentDate: null,
      rightOfPublicity: null,
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(service.adherents());
  });

  it('updates only the matching member while preserving its identifier', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const service = new AdherentService();
    service.add(memberInput);
    service.update(1, { ...memberInput, firstName: 'Alexandre', role: 'Capitaine' });
    service.update(99, memberInput);

    expect(service.adherents()).toEqual([
      {
        ...memberInput,
        id: 1,
        firstName: 'Alexandre',
        role: 'Capitaine',
        medicalCertificate: null,
        medicalCertificateReceivedDate: null,
        membershipPaymentDate: null,
        rightOfPublicity: null,
      },
    ]);
  });

  it('preserves stored consents when updating a member', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([member]));
    const service = new AdherentService();
    service.update(member.id, {
      ...memberInput,
      registrationStatus: 'finalized',
      firstName: 'Alexandre',
    });

    expect(service.adherents()[0]).toEqual({ ...member, firstName: 'Alexandre' });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(service.adherents());
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

    expect(service.adherents()).toEqual([
      {
        ...memberInput,
        id: 2,
        medicalCertificate: null,
        medicalCertificateReceivedDate: null,
        membershipPaymentDate: null,
        rightOfPublicity: null,
      },
    ]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(service.adherents());
  });

  it.each([null, '2024-01-02'])(
    'keeps payment-confirmed registrations validated even with legacy certificate date %s',
    (medicalCertificateReceivedDate) => {
      let stored = JSON.stringify([
        { ...member, registrationStatus: 'validated', medicalCertificateReceivedDate },
      ]);
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        expect(key).toBe(STORAGE_KEY);
        return stored;
      });
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
        expect(key).toBe(STORAGE_KEY);
        stored = value;
      });

      try {
        const service = new AdherentService();
        service.confirmPayment(member.id, '2024-01-03');
        const reloaded = new AdherentService().adherents()[0];
        expect(setItem).toHaveBeenCalledOnce();
        expect(reloaded.registrationStatus).toBe('validated');
        expect(reloaded.medicalCertificateReceivedDate).toBe(medicalCertificateReceivedDate);
        expect(reloaded.membershipPaymentDate).toBe('2024-01-03');
      } finally {
        getItem.mockRestore();
        setItem.mockRestore();
      }
    },
  );

  it('rejects invalid dates, repeated confirmations and status bypasses', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...member, registrationStatus: 'validated', medicalCertificate: false }]),
    );
    const service = new AdherentService();
    for (const date of ['', '2024-02-30', '2999-01-01', '1899-12-31']) {
      expect(() => service.confirmPayment(member.id, date)).toThrow();
    }
    expect(() =>
      service.update(member.id, { ...memberInput, registrationStatus: 'finalized' }),
    ).toThrow();
    expect(() => service.add({ ...memberInput, registrationStatus: 'finalized' })).toThrow();
    service.confirmPayment(member.id, '2024-01-02');
    expect(() => service.confirmPayment(member.id, '2024-01-03')).toThrow();
    expect(service.adherents()[0].registrationStatus).toBe('validated');
    expect(service.adherents()[0].membershipPaymentDate).toBe('2024-01-02');
    expect(() => service.confirmPayment(999, '2024-01-02')).toThrow();
  });

  it('persists payment details and preserves them after member edits and reload', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...member, registrationStatus: 'validated' }]),
    );
    const service = new AdherentService();
    const paymentDetails = {
      comment: 'Paiement par chèque',
      document: { name: 'recu.pdf', data: 'data:application/pdf;base64,dGVzdA==' },
    };
    service.confirmPayment(member.id, '2024-01-02', paymentDetails);
    service.update(member.id, { ...memberInput, registrationStatus: 'validated' });
    expect(new AdherentService().adherents()[0]).toMatchObject({
      membershipPaymentDate: '2024-01-02',
      paymentDetails,
    });
  });

  it('rejects invalid payment details without confirming payment', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...member, registrationStatus: 'validated' }]),
    );
    const service = new AdherentService();
    expect(() =>
      service.confirmPayment(member.id, '2024-01-02', {
        comment: '',
        document: { name: 'document.html', data: 'data:text/html;base64,dGVzdA==' },
      }),
    ).toThrow();
    expect(service.adherents()[0].membershipPaymentDate).toBeNull();
  });

  it('migrates missing dates without turning a validated registration into a finalized one', () => {
    const { medicalCertificateReceivedDate, membershipPaymentDate, ...oldMember } = member;
    void medicalCertificateReceivedDate;
    void membershipPaymentDate;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...oldMember, registrationStatus: 'validated' }]),
    );
    expect(new AdherentService().adherents()[0]).toMatchObject({
      registrationStatus: 'validated',
      medicalCertificateReceivedDate: null,
      membershipPaymentDate: null,
    });
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
