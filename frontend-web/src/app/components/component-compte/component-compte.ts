import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RegisterInput } from '../../api/model/registerInput';
import { UserDetails } from '../../api/model/userDetails';
import { UsersService } from '../../api/api/users.service';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { AuthService } from '../../services/auth.service';

/** Ensures that the new password confirmation matches the new password. */
function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation ? null : { passwordsMismatch: true };
}

@Component({
  imports: [Banner, Button, ReactiveFormsModule],
  selector: 'app-component-compte',
  styleUrl: './component-compte.css',
  templateUrl: './component-compte.html',
})
export class ComponentCompte {
  protected readonly submitted = signal(false);
  protected readonly passwordSubmitted = signal(false);
  protected readonly deleteConfirmed = signal(false);
  protected readonly accountDeleted = signal(false);
  protected readonly profileError = signal<string | null>(null);
  protected readonly profileRole = signal<UserDetails.RoleEnum | null>(null);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly pronouns = Object.values(RegisterInput.PronounEnum);

  constructor() {
    if (this.authService.isAuthenticated()) {
      inject(UsersService)
        .getMyProfile()
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: ({ role }) => this.profileRole.set(role),
          error: () =>
            this.profileError.set('Impossible de charger votre profil. Veuillez réessayer.'),
        });
    }
  }

  protected readonly accountForm = new FormBuilder().nonNullable.group({
    firstName: ['Alex', [Validators.required]],
    lastName: ['Martin', [Validators.required]],
    pronoun: new FormControl<RegisterInput.PronounEnum | null>(RegisterInput.PronounEnum.Il, [
      Validators.required,
    ]),
    email: ['alex.martin@example.com', [Validators.required, Validators.email]],
    phone: ['06 00 00 00 00'],
    birthday: [''],
    healthData: [false],
    imageRights: [false],
  });

  protected readonly passwordForm = new FormBuilder().nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  /** Marks the account form as submitted and reveals invalid fields. */
  protected save(): void {
    this.submitted.set(true);

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
    }
  }

  /** Marks the password form as submitted and reveals invalid fields. */
  protected changePassword(): void {
    this.passwordSubmitted.set(true);

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
    }
  }

  /** Deletes the account only after the user confirms the action. */
  protected deleteAccount(): void {
    if (!this.deleteConfirmed()) {
      return;
    }

    this.accountDeleted.set(true);
    this.profileRole.set(null);
    this.deleteConfirmed.set(false);
  }

  /** Returns the user to the home page. */
  protected logout(): void {
    this.profileRole.set(null);
    this.authService.logout();
    void this.router.navigate(['/accueil']);
  }
}
