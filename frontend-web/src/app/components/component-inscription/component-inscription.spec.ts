import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentInscription } from './component-inscription';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../../api';

class MockBroadcastChannel {
  static channels: MockBroadcastChannel[] = [];
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  close = vi.fn();

  constructor(readonly name: string) {
    MockBroadcastChannel.channels.push(this);
  }
}

describe('ComponentInscription', () => {
  let component: ComponentInscription;
  let fixture: ComponentFixture<ComponentInscription>;
  let register: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    MockBroadcastChannel.channels = [];
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    register = vi.fn().mockReturnValue(of(undefined));
    navigate = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ComponentInscription],
      providers: [
        { provide: Router, useValue: { navigate } },
        {
          provide: AuthenticationService,
          useValue: { register },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentInscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes the reading channel when the form is destroyed', () => {
    const channel = MockBroadcastChannel.channels[0];
    fixture.destroy();
    expect(channel.close).toHaveBeenCalledOnce();
  });

  it('links the required privacy consent to the privacy policy page', () => {
    expect(
      fixture.nativeElement.querySelector(
        '.agreements a[href^="/politique-confidentialite?lecture="]',
      ),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Inscrivez-vous à l’association');
    expect(fixture.nativeElement.textContent).toContain('Gières Volley-Ball');
    expect(fixture.nativeElement.querySelector('[formControlName="associationName"]')).toBeNull();
  });

  it('shows validation errors when required fields are invalid', async () => {
    const fields: Record<string, string> = {
      firstName: '',
      lastName: '',
      email: 'email-invalide',
      phone: '',
      password: 'court',
      confirmPassword: 'different',
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const pronoun = fixture.nativeElement.querySelector(
      '[formControlName="pronoun"]',
    ) as HTMLSelectElement;
    pronoun.value = '';
    pronoun.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.field .error').length).toBeGreaterThanOrEqual(
      6,
    );
    expect(fixture.nativeElement.textContent).toContain('Les mots de passe ne correspondent pas.');

    fixture.nativeElement.querySelector('button[type="submit"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('links the required internal rules consent to the club regulations', () => {
    expect(
      fixture.nativeElement.querySelector('.agreements a[href^="/reglement-interieur?lecture="]'),
    ).not.toBeNull();
  });

  it('unlocks each required agreement checkbox only after reaching its document bottom', () => {
    const privacyCheckbox = fixture.nativeElement.querySelector(
      '[formControlName="privacyPolicy"]',
    ) as HTMLInputElement;
    const internalRulesCheckbox = fixture.nativeElement.querySelector(
      '[formControlName="internalRules"]',
    ) as HTMLInputElement;
    const privacyLink = fixture.nativeElement.querySelector(
      'a[href^="/politique-confidentialite?lecture="]',
    ) as HTMLAnchorElement;
    const internalRulesLink = fixture.nativeElement.querySelector(
      'a[href^="/reglement-interieur?lecture="]',
    ) as HTMLAnchorElement;

    expect(privacyCheckbox.disabled).toBe(false);
    expect(internalRulesCheckbox.disabled).toBe(false);
    expect(privacyLink.closest('label')?.textContent?.replace(/\s+/g, ' ')).toContain(
      'J’ai pris connaissance de la politique de confidentialité de l’association.',
    );
    expect(internalRulesLink.closest('label')?.textContent?.replace(/\s+/g, ' ')).toContain(
      'J’atteste avoir lu et accepté le règlement intérieur de l’association.',
    );

    privacyCheckbox.click();
    internalRulesCheckbox.click();
    fixture.detectChanges();
    expect(privacyCheckbox.checked).toBe(false);
    expect(internalRulesCheckbox.checked).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'Veuillez ouvrir la politique de confidentialité et la faire défiler jusqu’en bas',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Veuillez ouvrir le règlement intérieur et le faire défiler jusqu’en bas',
    );

    privacyLink.click();
    privacyCheckbox.click();
    fixture.detectChanges();
    expect(privacyCheckbox.checked).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'Veuillez ouvrir la politique de confidentialité et la faire défiler jusqu’en bas',
    );
    MockBroadcastChannel.channels[0].onmessage?.({ data: 'privacyPolicy' } as MessageEvent);
    fixture.detectChanges();
    privacyCheckbox.click();
    expect(privacyCheckbox.checked).toBe(true);
    expect(internalRulesCheckbox.checked).toBe(false);

    internalRulesLink.click();
    internalRulesCheckbox.click();
    expect(internalRulesCheckbox.checked).toBe(false);
    MockBroadcastChannel.channels[0].onmessage?.({ data: 'internalRules' } as MessageEvent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain(
      'Veuillez ouvrir le règlement intérieur et le faire défiler jusqu’en bas',
    );
    internalRulesCheckbox.click();
    expect(internalRulesCheckbox.checked).toBe(true);
  });

  it('keeps one password hint and highlights it only while the password is invalid', () => {
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const hint = fixture.nativeElement.querySelector('#password-hint') as HTMLParagraphElement;

    expect(hint.textContent?.trim()).toBe('Au moins 8 caractères, une majuscule et un symbole.');
    expect(fixture.nativeElement.querySelectorAll('#password-hint').length).toBe(1);
    expect(hint.classList.contains('error')).toBe(false);

    password.value = 'tropcourt';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(hint.classList.contains('error')).toBe(true);

    password.value = 'Motdepasse1!';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(hint.classList.contains('error')).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('#password-hint').length).toBe(1);
  });

  it('rejects phone numbers with more than 10 digits', () => {
    const phone = fixture.nativeElement.querySelector('#phone') as HTMLInputElement;

    phone.value = '06 00 00 00 001';
    phone.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Le numéro de téléphone ne peut pas dépasser 10 chiffres.',
    );
    expect(phone.getAttribute('aria-invalid')).toBe('true');

    phone.value = '06 00 00 00 00';
    phone.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain(
      'Le numéro de téléphone ne peut pas dépasser 10 chiffres.',
    );
    expect(phone.getAttribute('aria-invalid')).toBe('false');
  });

  it('submits a valid registration after accepting all agreements', async () => {
    const fields: Record<string, string> = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'Motdepasse1!',
      confirmPassword: 'Motdepasse1!',
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const pronoun = fixture.nativeElement.querySelector(
      '[formControlName="pronoun"]',
    ) as HTMLSelectElement;
    pronoun.value = 'Elle';
    pronoun.dispatchEvent(new Event('change', { bubbles: true }));

    MockBroadcastChannel.channels[0].onmessage?.({ data: 'privacyPolicy' } as MessageEvent);
    MockBroadcastChannel.channels[0].onmessage?.({ data: 'internalRules' } as MessageEvent);
    fixture.detectChanges();

    for (const name of ['privacyPolicy', 'internalRules', 'healthData', 'imageRights']) {
      const checkbox = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      checkbox.click();
    }
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain(
      'Les mots de passe ne correspondent pas.',
    );

    fixture.nativeElement.querySelector('button[type="submit"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        associationName: 'Gières Volley-Ball',
        name: 'Lovelace',
        firstName: 'Ada',
        email: 'ada@example.com',
        pronoun: 'Elle',
        phoneNumber: '0600000000',
        password: 'Motdepasse1!',
      }),
    );
  });

  it('navigates to /connexion after successful registration', async () => {
    component['registrationForm'].patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      pronoun: 'Elle',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'Motdepasse1!',
      confirmPassword: 'Motdepasse1!',
      internalRules: true,
      privacyPolicy: true,
    });

    component['submit']();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/connexion']);
  });

  it('includes birthday when provided', async () => {
    component['registrationForm'].patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      pronoun: 'Elle',
      birthday: '1815-12-10',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'Motdepasse1!',
      confirmPassword: 'Motdepasse1!',
      internalRules: true,
      privacyPolicy: true,
    });

    component['submit']();
    await fixture.whenStable();

    expect(register).toHaveBeenCalledWith(expect.objectContaining({ birthday: '1815-12-10' }));
  });

  it('marks required agreement checkboxes as invalid and does not submit when unchecked', async () => {
    component['registrationForm'].patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      pronoun: 'Elle',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'Motdepasse1!',
      confirmPassword: 'Motdepasse1!',
      internalRules: false,
      privacyPolicy: false,
    });

    fixture.nativeElement.querySelector('button[type="submit"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    const privacyCheckbox = fixture.nativeElement.querySelector(
      '[formControlName="privacyPolicy"]',
    ) as HTMLInputElement;
    const internalRulesCheckbox = fixture.nativeElement.querySelector(
      '[formControlName="internalRules"]',
    ) as HTMLInputElement;

    expect(privacyCheckbox.getAttribute('aria-invalid')).toBe('true');
    expect(internalRulesCheckbox.getAttribute('aria-invalid')).toBe('true');
    expect(register).not.toHaveBeenCalled();
  });

  it('toggles password and confirmation visibility', () => {
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const confirmation = fixture.nativeElement.querySelector(
      '#confirmPassword',
    ) as HTMLInputElement;
    const toggles = fixture.nativeElement.querySelectorAll(
      '.password-toggle button',
    ) as NodeListOf<HTMLButtonElement>;

    expect(password.type).toBe('password');
    expect(confirmation.type).toBe('password');
    toggles[0].click();
    toggles[1].click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
    expect(confirmation.type).toBe('text');
    expect(toggles[0].textContent).toContain('Masquer');
    expect(toggles[1].textContent).toContain('Masquer');

    toggles[0].click();
    toggles[1].click();
    fixture.detectChanges();
    expect(password.type).toBe('password');
    expect(confirmation.type).toBe('password');
  });

  it('shows an error when confirmPassword is left empty after interaction', () => {
    const confirmPassword = fixture.nativeElement.querySelector(
      '#confirmPassword',
    ) as HTMLInputElement;
    confirmPassword.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirmez votre mot de passe.');
  });

  it('does not call register when pronoun is empty despite form being valid', () => {
    component['registrationForm'].patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      pronoun: 'Elle',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'Motdepasse1!',
      confirmPassword: 'Motdepasse1!',
      internalRules: true,
      privacyPolicy: true,
    });
    const pronounControl = component['registrationForm'].controls.pronoun;
    pronounControl.clearValidators();
    pronounControl.setValue('');
    pronounControl.updateValueAndValidity();

    component['submit']();

    expect(register).not.toHaveBeenCalled();
  });

  it.each([
    [409, 'Un compte existe déjà avec cette adresse e-mail.'],
    [429, 'Trop de tentatives. Veuillez patienter avant de réessayer.'],
    [500, 'Une erreur est survenue pendant l’inscription. Veuillez réessayer.'],
  ])('shows the registration error for status %s', async (status, message) => {
    register.mockReturnValue(throwError(() => ({ status })));
    component['registrationForm'].patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      pronoun: 'Elle',
      birthday: '1815-12-10',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'Motdepasse1!',
      confirmPassword: 'Motdepasse1!',
      internalRules: true,
      privacyPolicy: true,
    });

    component['submit']();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(message);
  });
});
