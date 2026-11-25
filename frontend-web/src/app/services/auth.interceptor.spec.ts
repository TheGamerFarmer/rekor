import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api';
import { UserDetails } from '../api/model/userDetails';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('rekor-access-token', 'old-access');
    localStorage.setItem('rekor-refresh-token', 'old-refresh');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideApi({
          basePath: '/api',
          accessToken: () => localStorage.getItem('rekor-access-token') ?? '',
        }),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  function unauthorized(url: string): void {
    http.expectOne(url).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  }

  it('refreshes both tokens and retries the failed request with the new access token', () => {
    const success = vi.fn();
    client.get('/api/events').subscribe(success);
    unauthorized('/api/events');

    const refresh = http.expectOne('/api/auth/refresh');
    expect(refresh.request.method).toBe('POST');
    expect(refresh.request.body).toEqual({ refresh_token: 'old-refresh' });
    refresh.flush({ access_token: 'new-access', refresh_token: 'new-refresh' });

    expect(localStorage.getItem('rekor-access-token')).toBe('new-access');
    expect(localStorage.getItem('rekor-refresh-token')).toBe('new-refresh');
    const retry = http.expectOne('/api/events');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-access');
    retry.flush({ ok: true });
    expect(success).toHaveBeenCalledWith({ ok: true });
  });

  it('refreshes a generated profile request during login', () => {
    const complete = vi.fn();
    auth
      .login({ email: 'user@example.com', password: 'password', associationName: 'Club' })
      .subscribe({ complete });
    http.expectOne('/api/auth/login').flush({
      access_token: 'login-access',
      refresh_token: 'login-refresh',
    });
    const profile = http.expectOne('/api/users/me');
    expect(profile.request.headers.get('Authorization')).toBe('Bearer login-access');
    profile.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne('/api/auth/refresh');
    expect(refresh.request.body).toEqual({ refresh_token: 'login-refresh' });
    refresh.flush({ access_token: 'new-access', refresh_token: 'new-refresh' });
    const retry = http.expectOne('/api/users/me');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-access');
    retry.flush({ role: UserDetails.RoleEnum.Administrateur });
    expect(auth.role()).toBe(UserDetails.RoleEnum.Administrateur);
    expect(complete).toHaveBeenCalledOnce();
  });

  it('shares a refresh and reuses the new token for a delayed 401', () => {
    client.get('/api/one').subscribe();
    client.get('/api/two').subscribe();
    client.get('/api/three').subscribe();
    const delayed = http.expectOne('/api/three');
    unauthorized('/api/one');
    unauthorized('/api/two');
    const refresh = http.expectOne('/api/auth/refresh');
    refresh.flush({ access_token: 'new-access', refresh_token: 'new-refresh' });
    http.expectOne('/api/one').flush({});
    http.expectOne('/api/two').flush({});
    delayed.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    const retry = http.expectOne('/api/three');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-access');
    retry.flush({});
    http.expectNone('/api/auth/refresh');
  });

  it('clears the session when refresh is rejected with 401', () => {
    const error = vi.fn();
    client.get('/api/events').subscribe({ error });
    unauthorized('/api/events');
    unauthorized('/api/auth/refresh');
    expect(error).toHaveBeenCalledOnce();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('rekor-access-token')).toBeNull();
    expect(localStorage.getItem('rekor-refresh-token')).toBeNull();
  });

  it('preserves the session when refresh fails for another reason', () => {
    const error = vi.fn();
    client.get('/api/events').subscribe({ error });
    unauthorized('/api/events');
    http.expectOne('/api/auth/refresh').flush('Unavailable', {
      status: 503,
      statusText: 'Unavailable',
    });
    expect(error).toHaveBeenCalledOnce();
    expect(auth.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('rekor-refresh-token')).toBe('old-refresh');

    client.get('/api/events').subscribe();
    unauthorized('/api/events');
    http.expectOne('/api/auth/refresh').flush({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    });
    http.expectOne('/api/events').flush({});
  });

  it('clears role state when refresh fails during profile loading', () => {
    auth.loadRole().subscribe({ error: vi.fn() });
    unauthorized('/api/users/me');
    unauthorized('/api/auth/refresh');
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.role()).toBeNull();
    expect(auth.roleLoadError()).toBe(false);
  });

  it('does not restore a session after logout while refresh is in flight', () => {
    const error = vi.fn();
    client.get('/api/events').subscribe({ error });
    unauthorized('/api/events');
    const refresh = http.expectOne('/api/auth/refresh');
    auth.logout();
    refresh.flush({ access_token: 'new-access', refresh_token: 'new-refresh' });
    expect(error).toHaveBeenCalledOnce();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('rekor-access-token')).toBeNull();
    http.expectNone('/api/events');
  });

  it('clears a legacy session with no refresh token', () => {
    localStorage.removeItem('rekor-refresh-token');
    const error = vi.fn();
    client.get('/api/events').subscribe({ error });
    unauthorized('/api/events');
    expect(error).toHaveBeenCalledOnce();
    expect(auth.isAuthenticated()).toBe(false);
    http.expectNone('/api/auth/refresh');
  });

  it('does not refresh login failures, external requests or non-401 failures', () => {
    const error = vi.fn();
    client.post('/api/auth/login', {}).subscribe({ error });
    client.get('https://example.com/data').subscribe({ error });
    client.get('/api/events').subscribe({ error });
    unauthorized('/api/auth/login');
    unauthorized('https://example.com/data');
    http.expectOne('/api/events').flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(error).toHaveBeenCalledTimes(3);
    expect(auth.isAuthenticated()).toBe(true);
    http.expectNone('/api/auth/refresh');
  });

  it('does not refresh again when the retried request returns 401', () => {
    const error = vi.fn();
    client.get('/api/events').subscribe({ error });
    unauthorized('/api/events');
    http.expectOne('/api/auth/refresh').flush({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    });
    unauthorized('/api/events');
    expect(error).toHaveBeenCalledOnce();
    expect(auth.isAuthenticated()).toBe(true);
    http.expectNone('/api/auth/refresh');
  });
});
