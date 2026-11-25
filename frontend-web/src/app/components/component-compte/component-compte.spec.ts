import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

import { ComponentCompte } from './component-compte';
import { AuthService } from '../../services/auth.service';
import { UserDetails } from '../../api/model/userDetails';
import { UsersService } from '../../api/api/users.service';

describe('ComponentCompte', () => {
  let component: ComponentCompte;
  let fixture: ComponentFixture<ComponentCompte>;
  let getMyProfile: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getMyProfile = vi.fn().mockReturnValue(of({ role: UserDetails.RoleEnum.Visiteur }));
    await TestBed.configureTestingModule({
      imports: [ComponentCompte],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), isAuthenticated: signal(true) } },
        { provide: UsersService, useValue: { getMyProfile } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCompte);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('groups the account topics into four separate cards', () => {
    component['profileRole'].set(UserDetails.RoleEnum.Adhrent);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.account-grid .account-card');

    expect(cards).toHaveLength(4);
    expect(
      Array.from(cards, (card) => (card as HTMLElement).querySelector('h2')?.textContent),
    ).toEqual([
      'Informations personnelles',
      'Supprimer mon compte',
      'Certificat médical',
      'Modifier le mot de passe',
    ]);
    const certificate = fixture.nativeElement.querySelector(
      '[aria-labelledby="certificate-title"]',
    );
    expect(certificate.nextElementSibling.getAttribute('aria-labelledby')).toBe('password-title');
  });

  it('shows the account banner and consent checkboxes below the birthday field', () => {
    const banner = fixture.nativeElement.querySelector('app-component-banner');
    const birthday = fixture.nativeElement.querySelector('#birthday');
    const checkboxes = fixture.nativeElement.querySelectorAll(
      'input[type="checkbox"][formControlName]',
    ) as NodeListOf<HTMLInputElement>;

    expect(banner).not.toBeNull();
    expect(banner.getAttribute('title')).toBe('Mon compte');
    expect(checkboxes).toHaveLength(2);
    expect(
      birthday.compareDocumentPosition(checkboxes[0]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(checkboxes[0].getAttribute('formControlName')).toBe('healthData');
    expect(checkboxes[1].getAttribute('formControlName')).toBe('imageRights');
    expect(fixture.nativeElement.textContent).toContain(
      'J’accepte que mon certificat médical soit collecté dans le cadre de mon inscription à l’association.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'J’autorise l’association à utiliser et à diffuser les photos et vidéos sur lesquelles j’apparais, prises dans le cadre de ses activités, sur son site internet et ses supports de communication, selon les modalités précisées dans l’autorisation de droit à l’image.',
    );
  });

  it('allows selecting a certificate and date without pretending to transmit them', () => {
    component['profileRole'].set(UserDetails.RoleEnum.Adhrent);
    fixture.detectChanges();
    const upload = fixture.nativeElement.querySelector('#medical-certificate') as HTMLInputElement;
    const date = fixture.nativeElement.querySelector('#certificate-date') as HTMLInputElement;
    const submit = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Transmettre le certificat'));

    expect(upload.disabled).toBe(false);
    expect(date.type).toBe('date');
    expect(date.disabled).toBe(false);
    date.value = '2026-11-24';
    date.dispatchEvent(new Event('input', { bubbles: true }));
    expect(date.value).toBe('2026-11-24');
    expect(submit?.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('le remettre directement au club');
    expect(fixture.nativeElement.querySelector('#certificate-unavailable')).toBeNull();
  });

  it('shows the certificate card for every non-visitor role', () => {
    for (const role of [null, UserDetails.RoleEnum.Visiteur] as const) {
      component['profileRole'].set(role);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#medical-certificate')).toBeNull();
    }

    for (const role of [
      UserDetails.RoleEnum.Adhrent,
      UserDetails.RoleEnum.Capitaine,
      UserDetails.RoleEnum.Entraineur,
      UserDetails.RoleEnum.Administrateur,
    ]) {
      component['profileRole'].set(role);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#medical-certificate')).not.toBeNull();
    }
  });

  it('loads the real profile role and keeps the card hidden until the profile arrives', () => {
    const profile = new Subject<UserDetails>();
    getMyProfile.mockReturnValue(profile);
    const pending = TestBed.createComponent(ComponentCompte);
    pending.detectChanges();
    expect(pending.nativeElement.querySelector('#medical-certificate')).toBeNull();

    profile.next({
      id: '1',
      name: 'Martin',
      email: 'alex@example.com',
      pronoun: UserDetails.PronounEnum.Iel,
      role: UserDetails.RoleEnum.Adhrent,
      medicalCertificate: false,
      rightOfPublicity: false,
    });
    pending.detectChanges();
    expect(pending.nativeElement.querySelector('#medical-certificate')).not.toBeNull();
    pending.destroy();
  });

  it('reports a profile loading error without showing the certificate', () => {
    getMyProfile.mockReturnValue(throwError(() => new Error('Profil indisponible')));
    const failed = TestBed.createComponent(ComponentCompte);
    failed.detectChanges();
    expect(failed.nativeElement.querySelector('#medical-certificate')).toBeNull();
    expect(failed.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Impossible de charger votre profil',
    );
    failed.destroy();
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

    expect(fixture.nativeElement.querySelectorAll('.field .error').length).toBe(3);
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
    const deleteButton = fixture.nativeElement.querySelector(
      '.delete-button button',
    ) as HTMLButtonElement;
    const confirmation = fixture.nativeElement.querySelector(
      '.account-danger input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(deleteButton.disabled).toBe(true);
    confirmation.click();
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(false);

    deleteButton.click();
    fixture.detectChanges();

    expect(deleteButton.disabled).toBe(true);
    expect(deleteButton.textContent).toContain('Compte supprimé');
    expect(confirmation.checked).toBe(false);
  });

  it('shows pronoun validation error when touched and empty', () => {
    const pronounControl = component['accountForm'].controls.pronoun;
    pronounControl.setValue(null);
    pronounControl.markAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sélectionnez votre pronom.');
  });

  it('shows error when new password confirmation is empty after interaction', () => {
    const confirmPassword = fixture.nativeElement.querySelector(
      '#confirmPassword',
    ) as HTMLInputElement;
    confirmPassword.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirmez votre nouveau mot de passe.');
  });

  it('does not delete account when called without confirmation', () => {
    component['deleteAccount']();

    expect(component['accountDeleted']()).toBe(false);
  });

  it('navigates to the home page when logging out', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (fixture.nativeElement.querySelector('.logout-button button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/accueil']);
  });
});
