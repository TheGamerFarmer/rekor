import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from './services/auth.service';

import { App } from './app';

describe('App', () => {
  const isAuthenticated = signal(false);
  const logout = vi.fn();

  beforeEach(async () => {
    isAuthenticated.set(false);
    logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: 'accueil', redirectTo: '' }]),
        { provide: AuthService, useValue: { isAuthenticated, logout } },
      ],
    }).compileComponents();
  });

  function createApp() {
    const fixture = TestBed.createComponent(App);
    return { fixture };
  }

  it('should create the app', () => {
    const { fixture } = createApp();
    expect(fixture.componentInstance).toBeTruthy();
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

  it('shows account and logs out when logged in', () => {
    isAuthenticated.set(true);
    const { fixture } = createApp();
    fixture.detectChanges();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');

    expect(fixture.nativeElement.textContent).toContain('Mon compte');
    expect(fixture.nativeElement.textContent).toContain('Déconnexion');

    (fixture.nativeElement.querySelector('.login-link button') as HTMLButtonElement).click();

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/accueil']);
  });
});
