import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthenticationService } from '../api/api/authentication.service';
import { UsersService } from '../api/api/users.service';
import type { LoginInput } from '../api/model/loginInput';
import type { LoginResponse } from '../api/model/loginResponse';
import { UserDetails } from '../api/model/userDetails';

const ACCESS_TOKEN_KEY = 'rekor-access-token';
const REFRESH_TOKEN_KEY = 'rekor-refresh-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly usersService = inject(UsersService);
  readonly isAuthenticated = signal(this.hasStoredToken());
  readonly role = signal<UserDetails.RoleEnum | null>(null);
  readonly roleLoadError = signal(false);
  private roleRequest: Observable<UserDetails.RoleEnum> | null = null;
  private refreshRequest: Observable<string> | null = null;
  private sessionVersion = 0;

  get accessToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  }

  get sessionId(): number {
    return this.sessionVersion;
  }

  /** Authenticates a user and stores the returned access token. */
  login(credentials: LoginInput): Observable<void> {
    return this.authenticationService.login(credentials).pipe(
      tap((tokens) => {
        this.sessionVersion++;
        this.refreshRequest = null;
        this.storeTokens(tokens);
        this.role.set(null);
        this.roleLoadError.set(false);
        this.roleRequest = null;
        this.isAuthenticated.set(true);
      }),
      switchMap(() =>
        this.loadRole().pipe(
          map(() => undefined),
          catchError(() => of(undefined)),
        ),
      ),
    );
  }

  /** Loads the authenticated user's role from the API profile. */
  loadRole(): Observable<UserDetails.RoleEnum> {
    const role = this.role();
    if (role) {
      return of(role);
    }

    if (!this.isAuthenticated()) {
      return throwError(() => new Error('Une session est nécessaire pour charger le rôle.'));
    }

    if (!this.roleRequest) {
      const sessionId = this.sessionVersion;
      this.roleRequest = this.usersService.getMyProfile().pipe(
        map(({ role: profileRole }) => profileRole),
        tap((profileRole) => {
          if (sessionId !== this.sessionVersion) {
            throw new Error('La session a changé pendant le chargement du rôle.');
          }
          this.role.set(profileRole);
          this.roleLoadError.set(false);
        }),
        catchError((error: unknown) => {
          if (sessionId === this.sessionVersion) {
            this.roleRequest = null;
            this.roleLoadError.set(this.isAuthenticated());
          }
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.roleRequest;
  }

  /** Refreshes the current session, sharing one request between concurrent callers. */
  refresh(): Observable<string> {
    if (this.refreshRequest) {
      return this.refreshRequest;
    }

    const refreshToken =
      typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Aucun jeton de renouvellement disponible.'));
    }

    const sessionId = this.sessionVersion;
    const request = this.authenticationService.refreshTokens({ refresh_token: refreshToken }).pipe(
      map((tokens) => {
        if (sessionId !== this.sessionVersion) {
          throw new Error('La session a changé pendant son renouvellement.');
        }
        this.storeTokens(tokens);
        return tokens.access_token;
      }),
      catchError((error: unknown) => {
        if (
          sessionId === this.sessionVersion &&
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          this.logout();
        }
        return throwError(() => error);
      }),
      finalize(() => {
        if (this.refreshRequest === request) {
          this.refreshRequest = null;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.refreshRequest = request;
    return request;
  }

  /** Clears the local session. */
  logout(): void {
    this.sessionVersion++;
    this.refreshRequest = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    this.role.set(null);
    this.roleLoadError.set(false);
    this.roleRequest = null;
    this.isAuthenticated.set(false);
  }

  /** Checks whether a persisted access token is available in browser storage. */
  private hasStoredToken(): boolean {
    return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  }

  /** Persists both tokens returned by the authentication API. */
  private storeTokens(tokens: LoginResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
  }
}
