import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { Configuration } from '../api/configuration';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const basePath = inject(Configuration).basePath ?? '';
  const path = request.url.split('?')[0];
  if (
    !basePath ||
    !(path === basePath || path.startsWith(`${basePath}/`)) ||
    /^\/auth\/(login|register|refresh|logout)$/.test(path.slice(basePath.length))
  ) {
    return next(request);
  }

  const auth = inject(AuthService);
  const sessionId = auth.sessionId;
  const originalToken = auth.accessToken;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !auth.isAuthenticated() ||
        auth.sessionId !== sessionId
      ) {
        return throwError(() => error);
      }

      const currentToken = auth.accessToken;
      const token$ =
        currentToken && currentToken !== originalToken ? of(currentToken) : auth.refresh();
      return token$.pipe(
        switchMap((token) =>
          next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
        ),
      );
    }),
  );
};
