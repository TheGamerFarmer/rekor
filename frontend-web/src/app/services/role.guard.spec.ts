import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import type { GuardResult, MaybeAsync } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { UserDetails } from '../api/model/userDetails';
import { AuthService } from './auth.service';
import { administratorGuard, eventManagementGuard } from './role.guard';

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

  async function runGuard(
    guard: typeof administratorGuard | typeof eventManagementGuard,
  ): Promise<GuardResult> {
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return resolveGuardResult(result);
  }

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

  it('limits members and treasury routes to administrators', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.loadRole.mockReturnValue(of(UserDetails.RoleEnum.Entraineur));

    const result = await runGuard(administratorGuard);

    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/evenements']));
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
