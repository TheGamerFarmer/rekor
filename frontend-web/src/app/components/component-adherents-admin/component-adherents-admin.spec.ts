import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { AdherentService, type Adherent } from '../../services/adherent.service';
import { ComponentAdherentsAdmin } from './component-adherents-admin';

describe('ComponentAdherentsAdmin', () => {
  let fixture: ComponentFixture<ComponentAdherentsAdmin>;
  let members: WritableSignal<Adherent[]>;
  let add: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let confirmPayment: ReturnType<typeof vi.fn>;

  const validatedMember: Adherent = {
    id: 1,
    lastName: 'Martin',
    firstName: 'Alex',
    pronoun: 'Iel',
    birthDate: '2000-05-12',
    phone: '0600000000',
    email: 'alex@example.fr',
    role: 'Capitaine',
    registrationStatus: 'finalized',
    medicalCertificate: true,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: false,
  };
  const toValidateMember: Adherent = {
    ...validatedMember,
    id: 2,
    lastName: 'Durand',
    firstName: 'Sam',
    email: 'sam@example.fr',
    role: 'Adhérent',
    registrationStatus: 'pending',
  };

  beforeEach(async () => {
    members = signal([validatedMember, toValidateMember]);
    add = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    confirmPayment = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ComponentAdherentsAdmin],
      providers: [
        {
          provide: AdherentService,
          useValue: { adherents: members, add, update, remove, confirmPayment },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentAdherentsAdmin);
    fixture.detectChanges();
  });

  it('filters members by registration status', () => {
    expect(fixture.nativeElement.textContent).toContain('Sam Durand');
    expect(fixture.nativeElement.textContent).not.toContain('Alex Martin');

    const buttons = fixture.nativeElement.querySelectorAll(
      '.registration-filters button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(Array.from(buttons).map((button) => button.textContent)).toEqual(
      expect.arrayContaining(['Finalisées (1)', 'Validées (0)', 'En attente (1)', 'Refusées (0)']),
    );
    const validatedFilter = Array.from(buttons).find((button) =>
      button.textContent?.includes('Finalisées'),
    );
    expect(validatedFilter).toBeDefined();
    validatedFilter?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alex Martin');
    expect(fixture.nativeElement.textContent).not.toContain('Sam Durand');
  });

  it('displays consent as accepted only when the checkbox is checked', () => {
    members.set([
      toValidateMember,
      {
        ...toValidateMember,
        id: 3,
        firstName: 'Noa',
        medicalCertificate: false,
        rightOfPublicity: true,
      },
      {
        ...toValidateMember,
        id: 4,
        firstName: 'Camille',
        medicalCertificate: null,
        rightOfPublicity: null,
      },
    ]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.member-row') as NodeListOf<HTMLElement>;
    expect(rows[0].textContent).toContain('Collecte du certificat médical : Acceptée');
    expect(rows[0].textContent).toContain('Droit à l’image : Refusé');
    expect(rows[1].textContent).toContain('Collecte du certificat médical : Refusée');
    expect(rows[1].textContent).toContain('Droit à l’image : Accepté');
    expect(rows[2].textContent).toContain('Collecte du certificat médical : Refusée');
    expect(rows[2].textContent).toContain('Droit à l’image : Refusé');
  });

  it('removes a member when their registration is refused', () => {
    const accept = fixture.nativeElement.querySelector(
      '[aria-label="Valider l’inscription de Sam Durand"]',
    ) as HTMLButtonElement;
    const refuse = fixture.nativeElement.querySelector(
      '[aria-label="Refuser l’inscription de Sam Durand"]',
    ) as HTMLButtonElement;

    expect(accept.disabled).toBe(true);
    expect(refuse.disabled).toBe(false);
    expect(accept.classList.contains('button-success')).toBe(true);
    expect(fixture.nativeElement.querySelector('.registration-notice')).toBeNull();
    expect(update).not.toHaveBeenCalled();

    refuse.click();
    expect(remove).toHaveBeenCalledWith(toValidateMember.id);
  });

  it('allows payment confirmation without offering certificate validation', () => {
    members.set([
      ...members(),
      {
        ...toValidateMember,
        id: 3,
        firstName: 'Camille',
        registrationStatus: 'validated',
      },
    ]);
    const pendingFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Validées'));
    pendingFilter?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#certificate-date-3')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[aria-label^="Confirmer la réception"]'),
    ).toBeNull();
    const paymentDate = fixture.nativeElement.querySelector('#payment-date-3') as HTMLInputElement;
    expect(paymentDate.required).toBe(true);
    paymentDate.value = '2024-01-03';
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Confirmer le paiement de l’adhésion de Camille Durand"]',
      ) as HTMLButtonElement
    ).click();
    expect(confirmPayment).toHaveBeenCalledWith(3, '2024-01-03', {
      comment: '',
      document: null,
    });
    expect(fixture.nativeElement.querySelector('[aria-label^="Valider l’inscription"]')).toBeNull();
  });

  it('displays saved payment dates without offering certificate validation', () => {
    members.set([
      { ...toValidateMember, registrationStatus: 'validated', membershipPaymentDate: '2024-01-03' },
    ]);
    Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    )
      .find((button) => button.textContent?.includes('Validées'))
      ?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Adhésion payée le 03/01/2024');
    expect(fixture.nativeElement.textContent).toContain(
      'La finalisation après dépôt du certificat depuis le compte n’est pas encore disponible.',
    );
    expect(fixture.nativeElement.querySelector('#payment-date-2')).toBeNull();
    expect(fixture.nativeElement.querySelector('#certificate-date-2')).toBeNull();
  });

  it('rejects an oversized or unsupported payment document without confirming payment', () => {
    members.set([{ ...toValidateMember, registrationStatus: 'validated' }]);
    Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    )
      .find((button) => button.textContent?.includes('Validées'))
      ?.click();
    fixture.detectChanges();

    const date = fixture.nativeElement.querySelector('#payment-date-2') as HTMLInputElement;
    const input = fixture.nativeElement.querySelector('#payment-document-2') as HTMLInputElement;
    date.value = '2024-01-02';
    const button = fixture.nativeElement.querySelector(
      '[aria-label="Confirmer le paiement de l’adhésion de Sam Durand"]',
    ) as HTMLButtonElement;

    for (const file of [
      new File(['texte'], 'document.txt', { type: 'text/plain' }),
      new File([new Uint8Array(1024 * 1024 + 1)], 'document.pdf', { type: 'application/pdf' }),
    ]) {
      Object.defineProperty(input, 'files', { configurable: true, value: [file] });
      button.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        '1 Mo maximum',
      );
      expect(confirmPayment).not.toHaveBeenCalled();
    }
  });

  it('reports a storage failure without confirming payment', () => {
    members.set([{ ...toValidateMember, registrationStatus: 'validated' }]);
    Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    )
      .find((button) => button.textContent?.includes('Validées'))
      ?.click();
    fixture.detectChanges();
    confirmPayment.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    (fixture.nativeElement.querySelector('#payment-date-2') as HTMLInputElement).value =
      '2024-01-02';
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Confirmer le paiement de l’adhésion de Sam Durand"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Impossible de confirmer le paiement',
    );
    expect(fixture.nativeElement.querySelector('#payment-date-2')).not.toBeNull();
  });

  it('does not offer certificate validation regardless of consent', () => {
    members.set([
      {
        ...toValidateMember,
        registrationStatus: 'validated',
        medicalCertificate: false,
      },
      {
        ...toValidateMember,
        id: 3,
        firstName: 'Camille',
        registrationStatus: 'validated',
        medicalCertificate: null,
      },
    ]);
    const pendingFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Validées'));
    pendingFilter?.click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.member-row') as NodeListOf<HTMLElement>;
    expect(rows[0].querySelector('[aria-label^="Confirmer la réception"]')).toBeNull();
    expect(rows[1].querySelector('[aria-label^="Confirmer la réception"]')).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it('provides a refused registrations filter', () => {
    members.set([...members(), { ...toValidateMember, id: 3, registrationStatus: 'refused' }]);
    fixture.detectChanges();
    const refusedFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Refusées'));
    expect(refusedFilter?.textContent).toContain('(1)');
    refusedFilter?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sam Durand');
    expect(fixture.nativeElement.querySelector('[aria-label^="Refuser l’inscription"]')).toBeNull();
  });

  it('does not offer member creation or navigation to event administration', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Ajouter un adhérent');
    expect(fixture.nativeElement.querySelector('a[href="/admin/evenements"]')).toBeNull();
  });

  it('loads the selected member into the edit form', () => {
    const editButton = fixture.nativeElement.querySelector(
      '[aria-label="Modifier Sam Durand"]',
    ) as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#first-name').value).toBe('Sam');
    expect(fixture.nativeElement.querySelector('#email').value).toBe('sam@example.fr');
    expect(fixture.nativeElement.querySelector('#birth-date').type).toBe('date');
    expect(fixture.nativeElement.querySelector('#birth-date').value).toBe('2000-05-12');
    expect(fixture.nativeElement.querySelectorAll('.required-marker').length).toBe(6);
    expect(fixture.nativeElement.querySelector('#member-form-title').textContent).toContain(
      'Modifier',
    );
    expect(fixture.nativeElement.querySelector('#registration-status')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[formControlName="medicalCertificate"]'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('[formControlName="rightOfPublicity"]')).toBeNull();
  });

  it('shows the empty state when a registration category has no members', () => {
    const pendingFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Validées'));
    pendingFilter?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Aucun adhérent dans cette catégorie d’inscription.',
    );
  });

  it('shows the missing-birth-date state and leaves the edit field empty', () => {
    const memberWithoutBirthDate: Adherent = {
      ...toValidateMember,
      id: 3,
      firstName: 'Noé',
      birthDate: null,
    };
    members.set([...members(), memberWithoutBirthDate]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Date de naissance à compléter');

    const editButton = fixture.nativeElement.querySelector(
      '[aria-label="Modifier Noé Durand"]',
    ) as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();

    const birthDate = fixture.nativeElement.querySelector('#birth-date') as HTMLInputElement;
    expect(birthDate.value).toBe('');

    const firstName = fixture.nativeElement.querySelector('#first-name') as HTMLInputElement;
    firstName.value = 'Noémie';
    firstName.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(update).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ firstName: 'Noémie', birthDate: null }),
    );
  });

  it('selects one role in hierarchy order', () => {
    const editButton = fixture.nativeElement.querySelector(
      '[aria-label="Modifier Sam Durand"]',
    ) as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();

    const role = fixture.nativeElement.querySelector('#role') as HTMLSelectElement;
    expect(Array.from(role.options, (option) => option.value)).toEqual([
      '',
      'Administrateur',
      'Entraineur',
      'Capitaine',
      'Adhérent',
      'Visiteur',
    ]);
    role.value = 'Entraineur';
    role.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(update).toHaveBeenCalledWith(2, expect.objectContaining({ role: 'Entraineur' }));
  });

  it('preserves an existing role that is not in the temporary list', () => {
    members.set([{ ...toValidateMember, role: 'Arbitre' }]);
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[aria-label="Modifier Sam Durand"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const role = fixture.nativeElement.querySelector('#role') as HTMLSelectElement;
    expect(role.value).toBe('Arbitre');
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(update).toHaveBeenCalledWith(2, expect.objectContaining({ role: 'Arbitre' }));
  });

  it('shows validation errors and does not save an invalid form', () => {
    const editButton = fixture.nativeElement.querySelector(
      '[aria-label="Modifier Sam Durand"]',
    ) as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();

    const lastName = fixture.nativeElement.querySelector('#last-name') as HTMLInputElement;
    lastName.value = '';
    lastName.dispatchEvent(new Event('input', { bubbles: true }));
    const birthDate = fixture.nativeElement.querySelector('#birth-date') as HTMLInputElement;
    birthDate.value = '1899-12-31';
    birthDate.dispatchEvent(new Event('input', { bubbles: true }));
    const phone = fixture.nativeElement.querySelector('#phone') as HTMLInputElement;
    phone.value = 'invalid';
    phone.dispatchEvent(new Event('input', { bubbles: true }));
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    email.value = 'invalid';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    const role = fixture.nativeElement.querySelector('#role') as HTMLSelectElement;
    role.value = '';
    role.dispatchEvent(new Event('change', { bubbles: true }));

    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(update).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Le nom est obligatoire.');
    expect(fixture.nativeElement.textContent).toContain('Saisissez une date de naissance valide.');
    expect(fixture.nativeElement.textContent).toContain('Saisissez un numéro de téléphone valide.');
    expect(fixture.nativeElement.textContent).toContain('Saisissez une adresse e-mail valide.');
    expect(fixture.nativeElement.textContent).toContain('Sélectionnez un rôle.');
  });

  it('saves changes to the selected member', () => {
    const validatedFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Finalisées'));
    validatedFilter?.click();
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector(
      '[aria-label="Modifier Alex Martin"]',
    ) as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();

    const firstName = fixture.nativeElement.querySelector('#first-name') as HTMLInputElement;
    firstName.value = 'Alexandre';
    firstName.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ firstName: 'Alexandre', birthDate: '2000-05-12' }),
    );
  });

  it('calls the service to delete a member', () => {
    const deleteButton = fixture.nativeElement.querySelector(
      '[aria-label="Supprimer Sam Durand"]',
    ) as HTMLButtonElement;
    deleteButton.click();

    expect(remove).toHaveBeenCalledWith(2);
  });
});

describe('ComponentAdherentsAdmin with stored members', () => {
  beforeEach(() => localStorage.removeItem('rekor-adherents'));
  afterEach(() => localStorage.removeItem('rekor-adherents'));

  it('saves a payment comment and document and makes them available after reload', async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentAdherentsAdmin],
    }).compileComponents();
    const fixture = TestBed.createComponent(ComponentAdherentsAdmin);
    fixture.detectChanges();
    Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    )
      .find((button) => button.textContent?.includes('Validées'))
      ?.click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('#payment-date-6') as HTMLInputElement).value =
      '2024-01-03';
    (fixture.nativeElement.querySelector('#payment-comment-6') as HTMLTextAreaElement).value =
      'Paiement par chèque';
    const input = fixture.nativeElement.querySelector('#payment-document-6') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['test'], 'recu.pdf', { type: 'application/pdf' })],
    });
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Confirmer le paiement de l’adhésion de Lou Leroy"]',
      ) as HTMLButtonElement
    ).click();

    await vi.waitFor(() => {
      expect(new AdherentService().adherents().find(({ id }) => id === 6)).toMatchObject({
        membershipPaymentDate: '2024-01-03',
        paymentDetails: {
          comment: 'Paiement par chèque',
          document: { name: 'recu.pdf', data: 'data:application/pdf;base64,dGVzdA==' },
        },
      });
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Commentaire : Paiement par chèque');
    expect(fixture.nativeElement.textContent).toContain('Télécharger le justificatif : recu.pdf');
    const createObjectURL = vi.fn().mockReturnValue('blob:payment-document');
    const revokeObjectURL = vi.fn();
    const originalURL = URL;
    vi.stubGlobal(
      'URL',
      Object.assign(class extends originalURL {}, { createObjectURL, revokeObjectURL }),
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    try {
      (fixture.nativeElement.querySelector('.document-download') as HTMLButtonElement).click();
      expect(createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'application/pdf', size: 4 }),
      );
      expect(click).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:payment-document');
    } finally {
      click.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('keeps the registration validated after payment when no certificate was received', async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentAdherentsAdmin],
    }).compileComponents();
    const fixture = TestBed.createComponent(ComponentAdherentsAdmin);
    fixture.detectChanges();
    Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    )
      .find((button) => button.textContent?.includes('Validées'))
      ?.click();
    fixture.detectChanges();

    const paymentDate = fixture.nativeElement.querySelector('#payment-date-6') as HTMLInputElement;
    paymentDate.value = '2024-01-03';
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Confirmer le paiement de l’adhésion de Lou Leroy"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Lou Leroy');
    expect(new AdherentService().adherents().find(({ id }) => id === 6)).toMatchObject({
      registrationStatus: 'validated',
      medicalCertificateReceivedDate: null,
      membershipPaymentDate: '2024-01-03',
    });
  });
});
