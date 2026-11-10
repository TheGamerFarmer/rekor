import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation ? null : { passwordsMismatch: true };
}

function maxPhoneDigits(control: AbstractControl): ValidationErrors | null {
  const digitCount = String(control.value).replace(/\D/g, '').length;

  return digitCount > 10 ? { maxPhoneDigits: { max: 10, actual: digitCount } } : null;
}

@Component({
  imports: [Banner, Button, ReactiveFormsModule],
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
      phone: ['', [Validators.required, maxPhoneDigits]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*\p{Lu})(?=.*[^\p{L}\p{N}\s]).*$/u),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      internalRules: [false, [Validators.requiredTrue]],
      privacyPolicy: [false, [Validators.requiredTrue]],
      healthData: [false],
      imageRights: [false],
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
