import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import type { GuardResult, MaybeAsync } from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { UserDetails } from '../api/model/userDetails';
import { AuthService } from './auth.service';
import { administratorGuard, eventManagementGuard } from './role.guard';
import { routes } from '../app.routes';

describe('role guards', () => {
  const authService = {
    isAuthenticated: vi.fn(),
    loadRole: vi.fn(),
  };

  beforeEach(() => {
    authService.isAuthenticated.mockReset();
    authService.loadRole.mockReset();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });
  });

  /** Runs a guard inside Angular's injection context and resolves its result. */
  async function runGuard(
    guard: typeof administratorGuard | typeof eventManagementGuard,
  ): Promise<GuardResult> {
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return resolveGuardResult(result);
  }

  /** Converts synchronous, promise, and observable guard results to a promise. */
  function resolveGuardResult(result: MaybeAsync<GuardResult>): Promise<GuardResult> {
    if (result instanceof Observable) {
      return firstValueFrom(result);
    }
    if (result instanceof Promise) {
      return result;
    }
    return Promise.resolve(result);
  }

  it('requires an authenticated session for administration routes', async () => {
    authService.isAuthenticated.mockReturnValue(false);

    const result = await runGuard(administratorGuard);

    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/connexion']));
    expect(authService.loadRole).not.toHaveBeenCalled();
  });

  it('protects the news creation route with the administrator guard', () => {
    const route = routes.find(({ path }) => path === 'admin/actualites/nouveau');
    expect(route?.canActivate).toContain(administratorGuard);
  });

  it.each([
    UserDetails.RoleEnum.Entraineur,
    UserDetails.RoleEnum.Capitaine,
    UserDetails.RoleEnum.Adhrent,
  ])('denies the administrator route to %s', async (role) => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.loadRole.mockReturnValue(of(role));
    expect(await runGuard(administratorGuard)).toEqual(
      TestBed.inject(Router).createUrlTree(['/evenements']),
    );
  });

  it('allows administrators to access the administrator route', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.loadRole.mockReturnValue(of(UserDetails.RoleEnum.Administrateur));
    expect(await runGuard(administratorGuard)).toBe(true);
  });

  it('limits members and treasury routes to administrators', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.loadRole.mockReturnValue(of(UserDetails.RoleEnum.Entraineur));

    const result = await runGuard(administratorGuard);

    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/evenements']));
  });

  it('returns home when the authenticated user role cannot be loaded', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.loadRole.mockReturnValue(throwError(() => new Error('Profil indisponible')));

    const result = await runGuard(administratorGuard);

    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/']));
  });

  it.each([UserDetails.RoleEnum.Administrateur, UserDetails.RoleEnum.Capitaine])(
    'allows %s to manage events',
    async (role) => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.loadRole.mockReturnValue(of(role));

      expect(await runGuard(eventManagementGuard)).toBe(true);
    },
  );
});
