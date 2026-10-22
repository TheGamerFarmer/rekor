import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { provideApi } from './api';
import { App } from './app';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideApi('/api')],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  // Aucune requête ne doit rester sans réponse à la fin d'un test
  afterEach(() => http.verify());

  // L'application interroge le back dès sa création : chaque test doit lui répondre
  function createApp() {
    const fixture = TestBed.createComponent(App);
    return { fixture, request: http.expectOne('/api/') };
  }

  it('should create the app', () => {
    const { fixture, request } = createApp();
    request.flush({ status: 'ok' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the club homepage', async () => {
    const { fixture, request } = createApp();
    request.flush({ status: 'ok' });
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-site-header')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Gières vs Lyon');
    expect(compiled.querySelector('#rendez-vous h2')?.textContent).toContain(
      'Les prochains rendez-vous',
    );
    expect(compiled.querySelector('app-site-footer')).toBeTruthy();
    expect(compiled.querySelector('app-site-header img')?.getAttribute('src')).toBe(
      '/logo/logo_noir.png',
    );
    expect(compiled.querySelector('app-site-footer img')?.getAttribute('src')).toBe(
      '/logo/logo_noir.png',
    );
  });

  it('should show the status returned by the backend', async () => {
    const { fixture, request } = createApp();
    request.flush({ status: 'ok' });
    await fixture.whenStable();
    const status = fixture.nativeElement.querySelector('[data-testid="backend-status"]');
    expect(status?.textContent).toContain('Backend : ok');
  });

  it('should show "indisponible" when the backend fails', async () => {
    const { fixture, request } = createApp();
    request.flush('panne', { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();
    const status = fixture.nativeElement.querySelector('[data-testid="backend-status"]');
    expect(status?.textContent).toContain('Backend : indisponible');
  });
});
