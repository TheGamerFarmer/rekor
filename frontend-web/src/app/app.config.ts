import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideApi } from './api';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
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
