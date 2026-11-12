import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentConnexion } from './component-connexion';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

describe('ComponentConnexion', () => {
  let component: ComponentConnexion;
  let fixture: ComponentFixture<ComponentConnexion>;
  let login: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    login = vi.fn(() => of(undefined));
    await TestBed.configureTestingModule({
      imports: [ComponentConnexion],
      providers: [
        provideRouter([{ path: 'compte', redirectTo: '' }]),
        {
          provide: AuthService,
          useValue: { login },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentConnexion);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows email validation and submits valid credentials', async () => {
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    email.value = 'invalid-email';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#email-error')).not.toBeNull();
    expect(email.getAttribute('aria-invalid')).toBe('true');
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();

    email.value = 'joueur@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    password.value = 'motdepasse';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('toggles password visibility', () => {
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector(
      '.password-toggle button',
    ) as HTMLButtonElement;

    expect(password.type).toBe('password');
    toggle.click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Masquer le mot de passe');

    toggle.click();
    fixture.detectChanges();
    expect(password.type).toBe('password');
  });

  it('shows an error when authentication fails', async () => {
    login.mockReturnValueOnce(throwError(() => new Error('invalid credentials')));
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    email.value = 'joueur@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'motdepasse';
    password.dispatchEvent(new Event('input', { bubbles: true }));

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'E-mail ou mot de passe incorrect.',
    );
  });
});
