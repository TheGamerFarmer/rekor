import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserDetails } from '../api/model/userDetails';
import { AuthService } from './auth.service';

/** Creates a route guard that allows only users with one of the specified roles. */
function rolesGuard(allowedRoles: readonly UserDetails.RoleEnum[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/connexion']);
    }

    return authService.loadRole().pipe(
      map((role) => (allowedRoles.includes(role) ? true : router.createUrlTree(['/evenements']))),
      catchError(() => of(router.createUrlTree(['/']))),
    );
  };
}

export const administratorGuard = rolesGuard([UserDetails.RoleEnum.Administrateur]);
export const eventManagementGuard = rolesGuard([
  UserDetails.RoleEnum.Administrateur,
  UserDetails.RoleEnum.Entraineur,
  UserDetails.RoleEnum.Capitaine,
]);
