import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ComponentCompte } from './component-compte';

describe('ComponentCompte', () => {
  let component: ComponentCompte;
  let fixture: ComponentFixture<ComponentCompte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCompte],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCompte);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saves valid account information', async () => {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vos informations ont été enregistrées.');
  });

  it('shows account validation errors when submitted with invalid information', async () => {
    const fields: Record<string, string> = {
      firstName: '',
      lastName: '',
      email: 'email-invalide',
      phone: '',
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.field .error').length).toBe(4);
    expect(fixture.nativeElement.textContent).not.toContain(
      'Vos informations ont été enregistrées.',
    );
  });

  it('validates and changes the password', async () => {
    const passwordFields: Record<string, string> = {
      currentPassword: 'ancien-mot-de-passe',
      newPassword: 'nouveau-mot-de-passe',
      confirmPassword: 'nouveau-mot-de-passe',
    };

    for (const [name, value] of Object.entries(passwordFields)) {
      const input = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    fixture.nativeElement.querySelectorAll('form')[1].dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Votre mot de passe a été modifié.');
  });

  it('shows password errors when the new passwords do not match', async () => {
    const passwordFields: Record<string, string> = {
      currentPassword: '',
      newPassword: 'court',
      confirmPassword: 'different',
    };

    for (const [name, value] of Object.entries(passwordFields)) {
      const input = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    fixture.nativeElement.querySelectorAll('form')[1].dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Les mots de passe ne correspondent pas.');
    expect(fixture.nativeElement.textContent).not.toContain('Votre mot de passe a été modifié.');
  });

  it('deletes the account only after confirmation', () => {
    const deleteButton = fixture.nativeElement.querySelector('.delete-button') as HTMLButtonElement;
    const confirmation = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(deleteButton.disabled).toBe(true);
    confirmation.click();
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(false);

    deleteButton.click();
    fixture.detectChanges();

    expect(deleteButton.disabled).toBe(true);
    expect(deleteButton.textContent).toContain('Compte supprimé');
  });

  it('navigates to the home page when logging out', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/accueil']);
  });
});
