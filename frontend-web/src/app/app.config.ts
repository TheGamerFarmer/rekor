import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideApi } from './api';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApi({
      basePath: '/api',
      accessToken: () =>
        typeof localStorage !== 'undefined'
          ? (localStorage.getItem('rekor-access-token') ?? '')
          : '',
    }),
    provideRouter(routes),
  ],
};
