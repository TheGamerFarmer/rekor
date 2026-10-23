import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentConnexion } from './component-connexion';
import { provideRouter } from '@angular/router';

describe('ComponentConnexion', () => {
  let component: ComponentConnexion;
  let fixture: ComponentFixture<ComponentConnexion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentConnexion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentConnexion);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows email validation and the submitted message for valid credentials', async () => {
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

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Vos identifiants sont prêts à être envoyés.',
    );
  });

  it('toggles password visibility', () => {
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector('.password-toggle') as HTMLButtonElement;

    expect(password.type).toBe('password');
    toggle.click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Masquer le mot de passe');

    toggle.click();
    fixture.detectChanges();
    expect(password.type).toBe('password');
  });
});
