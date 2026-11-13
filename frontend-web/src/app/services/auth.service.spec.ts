import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api';
import { AuthService } from './auth.service';

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
    http.verify();
  });

  it('posts credentials to the backend login endpoint and stores the returned token', () => {
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    service.login({ email: 'joueur@example.com', password: 'motdepasse' }).subscribe();

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'joueur@example.com',
      password: 'motdepasse',
    });

    request.flush({ access_token: 'token-123', refresh_token: 'refresh-123' });

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
});
