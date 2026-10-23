import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentInscription } from './component-inscription';
import { provideRouter } from '@angular/router';

describe('ComponentInscription', () => {
  let component: ComponentInscription;
  let fixture: ComponentFixture<ComponentInscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentInscription],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentInscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('submits a valid registration after accepting all agreements', async () => {
    const fields: Record<string, string> = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '0600000000',
      password: 'motdepasse',
      confirmPassword: 'motdepasse',
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
  });

  it('toggles password and confirmation visibility', () => {
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const confirmation = fixture.nativeElement.querySelector(
      '#confirmPassword',
    ) as HTMLInputElement;
    const toggles = fixture.nativeElement.querySelectorAll(
      '.password-toggle',
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
});
