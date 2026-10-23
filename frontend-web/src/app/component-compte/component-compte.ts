import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RegisterInput } from '../api';
import PronounEnum = RegisterInput.PronounEnum;

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation ? null : { passwordsMismatch: true };
}

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-component-compte',
  styleUrl: './component-compte.css',
  templateUrl: './component-compte.html',
})
export class ComponentCompte {
  protected readonly submitted = signal(false);
  protected readonly passwordSubmitted = signal(false);
  protected readonly deleteConfirmed = signal(false);
  protected readonly accountDeleted = signal(false);

  private readonly router = inject(Router);
  protected readonly pronouns = Object.values(PronounEnum);

  protected readonly accountForm = new FormBuilder().nonNullable.group({
    firstName: ['Alex', [Validators.required]],
    lastName: ['Martin', [Validators.required]],
    pronoun: new FormControl<RegisterInput.PronounEnum | null>(PronounEnum.Il, [
      Validators.required,
    ]),
    email: ['alex.martin@example.com', [Validators.required, Validators.email]],
    phone: ['06 00 00 00 00'],
    birthday: [''],
  });

  protected readonly passwordForm = new FormBuilder().nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected save(): void {
    this.submitted.set(true);

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
    }
  }

  protected changePassword(): void {
    this.passwordSubmitted.set(true);

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
    }
  }

  protected deleteAccount(): void {
    if (!this.deleteConfirmed()) {
      return;
    }

    this.accountDeleted.set(true);
  }

  protected logout(): void {
    void this.router.navigate(['/accueil']);
  }
}
