import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AuthenticationService } from '../api/api/authentication.service';
import type { LoginInput } from '../api/model/loginInput';

const ACCESS_TOKEN_KEY = 'rekor-access-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticationService = inject(AuthenticationService);
  readonly isAuthenticated = signal(this.hasStoredToken());

  /** Authenticates a user and stores the returned access token. */
  login(credentials: LoginInput): Observable<void> {
    return this.authenticationService.login(credentials).pipe(
      tap(({ access_token }) => {
        this.setStoredToken(access_token);
        this.isAuthenticated.set(true);
      }),
      map(() => undefined),
    );
  }

  /** Clears the local session. */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
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
