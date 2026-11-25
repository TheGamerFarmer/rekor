import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { UserDetails } from './api/model/userDetails';

import { App } from './app';

describe('App', () => {
  const isAuthenticated = signal(false);
  const role = signal<UserDetails.RoleEnum | null>(null);
  const roleLoadError = signal(false);
  const loadRole = vi.fn(() => of(role()));
  const logout = vi.fn();

  beforeEach(async () => {
    isAuthenticated.set(false);
    role.set(null);
    roleLoadError.set(false);
    loadRole.mockReset();
    loadRole.mockImplementation(() => of(role()));
    logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: 'accueil', redirectTo: '' }]),
        {
          provide: AuthService,
          useValue: { isAuthenticated, role, roleLoadError, loadRole, logout },
        },
      ],
    }).compileComponents();
  });

  /** Creates the root component fixture used by the app template tests. */
  function createApp() {
    const fixture = TestBed.createComponent(App);
    return { fixture };
  }

  it('should create the app', () => {
    const { fixture } = createApp();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not interrupt startup when restoring the role fails', () => {
    isAuthenticated.set(true);
    loadRole.mockReturnValueOnce(throwError(() => new Error('Profil indisponible')));

    expect(() => createApp()).not.toThrow();
    expect(loadRole).toHaveBeenCalledOnce();
  });

  it('should render the club name', async () => {
    const { fixture } = createApp();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.club-name')?.textContent).toContain('Gières Volley-Ball');
  });

  it('shows login and registration actions when logged out', () => {
    const { fixture } = createApp();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Connexion');
    expect(fixture.nativeElement.textContent).toContain('Inscription');
  });

  it('links footer contact to the club page', () => {
    const { fixture } = createApp();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll(
      'footer a',
    ) as NodeListOf<HTMLAnchorElement>;
    const contact = Array.from(links).find((link) => link.textContent?.trim() === 'Contact');
    expect(contact?.getAttribute('href')).toBe('/presentation-club');
  });

  it('only shows footer registration when logged out', () => {
    const { fixture } = createApp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('footer a[href="/inscription"]')).not.toBeNull();

    isAuthenticated.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('footer a[href="/inscription"]')).toBeNull();

    isAuthenticated.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('footer a[href="/inscription"]')).not.toBeNull();
  });

  it('switches the footer login link to a working logout action', () => {
    const { fixture } = createApp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('footer a[href="/connexion"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('footer .footer-logout')).toBeNull();

    isAuthenticated.set(true);
    fixture.detectChanges();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    expect(fixture.nativeElement.querySelector('footer a[href="/connexion"]')).toBeNull();
    const logoutButton = fixture.nativeElement.querySelector(
      'footer .footer-logout',
    ) as HTMLButtonElement;
    expect(logoutButton.textContent).toContain('Déconnexion');
    logoutButton.click();

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/accueil']);

    isAuthenticated.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('footer a[href="/connexion"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('footer .footer-logout')).toBeNull();
  });

  it('shows account and logs out when logged in', () => {
    isAuthenticated.set(true);
    const { fixture } = createApp();
    fixture.detectChanges();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');

    expect(fixture.nativeElement.textContent).toContain('Mon compte');
    expect(fixture.nativeElement.textContent).toContain('Déconnexion');

    const logoutButton = fixture.nativeElement.querySelector(
      '.login-link button',
    ) as HTMLButtonElement;
    expect(logoutButton.classList.contains('button-uppercase')).toBe(true);
    logoutButton.click();

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/accueil']);
  });

  it('shows administration links according to the signed-in role', () => {
    isAuthenticated.set(true);
    role.set(UserDetails.RoleEnum.Administrateur);
    const { fixture } = createApp();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.admin-menu')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/admin/adherents"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/admin/tresorerie"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/admin/evenements"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/actualites"]'),
    ).not.toBeNull();

    role.set(UserDetails.RoleEnum.Entraineur);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-menu')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/admin/evenements"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/admin/adherents"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.admin-submenu a[href="/admin/tresorerie"]'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.admin-submenu a[href="/actualites"]')).toBeNull();

    role.set(UserDetails.RoleEnum.Adhrent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-menu')).toBeNull();
  });
});
