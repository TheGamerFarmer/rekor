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

  const validatedMember: Adherent = {
    id: 1,
    lastName: 'Martin',
    firstName: 'Alex',
    pronoun: 'Iel',
    birthDate: '2000-05-12',
    phone: '0600000000',
    email: 'alex@example.fr',
    role: 'Capitaine',
    registrationStatus: 'validated',
  };
  const toValidateMember: Adherent = {
    ...validatedMember,
    id: 2,
    lastName: 'Durand',
    firstName: 'Sam',
    email: 'sam@example.fr',
    role: 'Adhérent',
    registrationStatus: 'to-validate',
  };

  beforeEach(async () => {
    members = signal([validatedMember, toValidateMember]);
    add = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ComponentAdherentsAdmin],
      providers: [
        {
          provide: AdherentService,
          useValue: { adherents: members, add, update, remove },
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
    const validatedFilter = Array.from(buttons).find((button) =>
      button.textContent?.includes('Validées'),
    );
    expect(validatedFilter).toBeDefined();
    validatedFilter?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alex Martin');
    expect(fixture.nativeElement.textContent).not.toContain('Sam Durand');
  });

  it('presents disabled registration decisions without an explanatory notice', () => {
    const accept = fixture.nativeElement.querySelector(
      '[aria-label="Valider l’inscription de Sam Durand"]',
    ) as HTMLButtonElement;
    const refuse = fixture.nativeElement.querySelector(
      '[aria-label="Refuser l’inscription de Sam Durand"]',
    ) as HTMLButtonElement;

    expect(accept.disabled).toBe(true);
    expect(refuse.disabled).toBe(true);
    expect(accept.classList.contains('button-success')).toBe(true);
    expect(fixture.nativeElement.querySelector('.registration-notice')).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it('shows the disabled certificate confirmation only for pending registrations', () => {
    members.set([
      ...members(),
      {
        ...toValidateMember,
        id: 3,
        firstName: 'Camille',
        registrationStatus: 'pending-validation',
      },
    ]);
    const pendingFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('En cours de validation'));
    pendingFilter?.click();
    fixture.detectChanges();

    const confirmation = fixture.nativeElement.querySelector(
      '[aria-label="Confirmer la réception du certificat de Camille Durand"]',
    ) as HTMLButtonElement;
    expect(confirmation.disabled).toBe(true);
    expect(confirmation.classList.contains('button-success')).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label^="Valider l’inscription"]')).toBeNull();
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
    expect(fixture.nativeElement.querySelector('#member-form-title').textContent).toContain(
      'Modifier',
    );
    expect(fixture.nativeElement.querySelector('#registration-status')).toBeNull();
  });

  it('shows the empty state when a registration category has no members', () => {
    const pendingFilter = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.registration-filters button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('En cours de validation'));
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
    ).find((button) => button.textContent?.includes('Validées'));
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
