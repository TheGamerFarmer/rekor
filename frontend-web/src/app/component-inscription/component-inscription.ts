import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Banner } from '../component-banner/banner';
import { AuthenticationService, RegisterInput } from '../api';
import PronounEnum = RegisterInput.PronounEnum;

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation ? null : { passwordsMismatch: true };
}

@Component({
  imports: [Banner, ReactiveFormsModule, RouterLink],
  selector: 'app-component-inscription',
  styleUrl: './component-inscription.css',
  templateUrl: './component-inscription.html',
})
export class ComponentInscription {
  protected readonly showPassword = signal(false);
  protected readonly showConfirmation = signal(false);
  protected readonly submitted = signal(false);
  protected readonly pronouns = Object.values(PronounEnum);

  protected readonly registrationForm = new FormBuilder().nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      pronoun: new FormControl<RegisterInput.PronounEnum | null>(null, [Validators.required]),
      email: ['', [Validators.required, Validators.email]],
      phone: ['', []],
      birthday: ['', []],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      internalRules: [false, [Validators.requiredTrue]],
      healthData: [false, [Validators.requiredTrue]],
      privacyPolicy: [false, [Validators.requiredTrue]],
      imageRights: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  private readonly authentification = inject(AuthenticationService);

  protected submit(): void {
    this.submitted.set(true);

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const value = this.registrationForm.value;

    const doc: RegisterInput = {
      firstName: value.firstName ?? '',
      name: value.lastName ?? '',
      email: value.email ?? '',
      password: value.password ?? '',
      pronoun: value.pronoun ?? 'Il',
      ...(value.phone ? { phoneNumber: value.phone } : {}),
      ...(value.birthday ? { birthday: value.birthday } : {}),
    };

    this.authentification.register(doc);
  }
}
