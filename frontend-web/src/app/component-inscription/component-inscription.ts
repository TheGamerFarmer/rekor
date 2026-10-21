import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation ? null : { passwordsMismatch: true };
}

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-component-inscription',
  styleUrl: './component-inscription.css',
  templateUrl: './component-inscription.html',
})
export class ComponentInscription {
  protected readonly showPassword = signal(false);
  protected readonly showConfirmation = signal(false);
  protected readonly submitted = signal(false);

  protected readonly registrationForm = new FormBuilder().nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      internalRules: [false, [Validators.requiredTrue]],
      healthData: [false, [Validators.requiredTrue]],
      privacyPolicy: [false, [Validators.requiredTrue]],
      imageRights: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  protected submit(): void {
    this.submitted.set(true);

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
    }
  }
}
