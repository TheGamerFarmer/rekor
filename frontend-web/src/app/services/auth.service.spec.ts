import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideApi } from '../api';
import { AuthService } from './auth.service';
import { UserDetails } from '../api/model/userDetails';

describe('AuthService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideApi('/api')],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    http.verify();
  });

  it('posts credentials to the backend login endpoint and stores the returned token', () => {
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    service
      .login({
        email: 'joueur@example.com',
        password: 'motdepasse',
        associationName: 'Gières Volley-Ball',
      })
      .subscribe();

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'joueur@example.com',
      password: 'motdepasse',
      associationName: 'Gières Volley-Ball',
    });

    request.flush({ access_token: 'token-123', refresh_token: 'refresh-123' });
    http.expectOne('/api/users/me').flush({
      id: '1',
      name: 'Martin',
      email: 'joueur@example.com',
      pronoun: UserDetails.PronounEnum.Il,
      role: UserDetails.RoleEnum.Administrateur,
    });

    expect(localStorage.getItem('rekor-access-token')).toBe('token-123');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe(UserDetails.RoleEnum.Administrateur);
    service.loadRole().subscribe((role) => {
      expect(role).toBe(UserDetails.RoleEnum.Administrateur);
    });
  });

  it('rejects role loading when no user is authenticated', async () => {
    const service = TestBed.inject(AuthService);

    await expect(firstValueFrom(service.loadRole())).rejects.toThrow(
      'Une session est nécessaire pour charger le rôle.',
    );
  });

  it('keeps login successful when loading the profile role fails', () => {
    const service = TestBed.inject(AuthService);
    const complete = vi.fn();
    service
      .login({
        email: 'joueur@example.com',
        password: 'motdepasse',
        associationName: 'Gières Volley-Ball',
      })
      .subscribe({ complete });

    http.expectOne('/api/auth/login').flush({
      access_token: 'token-123',
      refresh_token: 'refresh-123',
    });
    http
      .expectOne('/api/users/me')
      .flush('Profil indisponible', { status: 500, statusText: 'Server Error' });

    expect(complete).toHaveBeenCalledOnce();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.roleLoadError()).toBe(true);
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
    expect(service.isAuthenticated()).toBe(false);
    http.expectOne('/api/auth/login').flush({
      access_token: 'token-123',
      refresh_token: 'refresh-123',
    });
    http.expectOne('/api/users/me').flush({
      id: '1',
      name: 'Martin',
      email: 'joueur@example.com',
      pronoun: UserDetails.PronounEnum.Il,
      role: UserDetails.RoleEnum.Visiteur,
    });
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });
});
