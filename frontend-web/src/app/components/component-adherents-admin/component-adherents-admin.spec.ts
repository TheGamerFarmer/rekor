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
    roles: ['Adhérent', 'Capitaine'],
    registrationStatus: 'validated',
  };
  const toValidateMember: Adherent = {
    ...validatedMember,
    id: 2,
    lastName: 'Durand',
    firstName: 'Sam',
    email: 'sam@example.fr',
    roles: ['Adhérent'],
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
