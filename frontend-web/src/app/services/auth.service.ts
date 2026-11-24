import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { AuthenticationService } from '../api/api/authentication.service';
import { UsersService } from '../api/api/users.service';
import type { LoginInput } from '../api/model/loginInput';
import { UserDetails } from '../api/model/userDetails';

const ACCESS_TOKEN_KEY = 'rekor-access-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly usersService = inject(UsersService);
  readonly isAuthenticated = signal(this.hasStoredToken());
  readonly role = signal<UserDetails.RoleEnum | null>(null);
  readonly roleLoadError = signal(false);
  private roleRequest: Observable<UserDetails.RoleEnum> | null = null;

  /** Authenticates a user and stores the returned access token. */
  login(credentials: LoginInput): Observable<void> {
    return this.authenticationService.login(credentials).pipe(
      tap(({ access_token }) => {
        this.setStoredToken(access_token);
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
      this.roleRequest = this.usersService.getMyProfile().pipe(
        map(({ role: profileRole }) => profileRole),
        tap((profileRole) => {
          this.role.set(profileRole);
          this.roleLoadError.set(false);
        }),
        catchError((error: unknown) => {
          this.roleRequest = null;
          this.roleLoadError.set(true);
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.roleRequest;
  }

  /** Clears the local session. */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    this.role.set(null);
    this.roleLoadError.set(false);
    this.roleRequest = null;
    this.isAuthenticated.set(false);
  }

  private hasStoredToken(): boolean {
    return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  }

  private setStoredToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }
}
