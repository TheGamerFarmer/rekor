import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthenticationService } from '../api/api/authentication.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let login: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    login = vi.fn(() => of({ access_token: 'token-123' }));
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: AuthenticationService, useValue: { login } }],
    });
  });

  it('starts unauthenticated and logs in with the returned token', () => {
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    service
      .login({
        associationName: 'Gières Volley-Ball',
        email: 'joueur@example.com',
        password: 'motdepasse',
      })
      .subscribe();

    expect(login).toHaveBeenCalledWith({
      associationName: 'Gières Volley-Ball',
      email: 'joueur@example.com',
      password: 'motdepasse',
    });
    expect(localStorage.getItem('rekor-access-token')).toBe('token-123');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('restores and clears a stored session', () => {
    localStorage.setItem('rekor-access-token', 'existing-token');
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    service.logout();

    expect(localStorage.getItem('rekor-access-token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('skips localStorage calls when unavailable (SSR)', () => {
    vi.stubGlobal('localStorage', undefined);

    const service = TestBed.inject(AuthService);
    service
      .login({
        associationName: 'Gières Volley-Ball',
        email: 'joueur@example.com',
        password: 'motdepasse',
      })
      .subscribe();
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);

    vi.unstubAllGlobals();
  });
});
