import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterInput } from '../../api';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { AuthenticationService } from '../../api';
import { readingChannelName } from './document-reading';

/** Ensures that the password confirmation matches the original password. */
function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  return password === confirmation ? null : { passwordsMismatch: true };
}

/** Rejects phone numbers containing more than ten digits. */
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
  private readonly associationName = 'Gières Volley-Ball';
  protected readonly showPassword = signal(false);
  protected readonly showConfirmation = signal(false);
  protected readonly submitted = signal(false);
  protected readonly registrationError = signal<string | null>(null);
  protected readonly privacyPolicyRead = signal(false);
  protected readonly internalRulesRead = signal(false);
  protected readonly privacyPolicyCheckboxAttempted = signal(false);
  protected readonly internalRulesCheckboxAttempted = signal(false);
  protected readonly pronouns = Object.values(RegisterInput.PronounEnum);
  protected readonly readingId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  protected readonly readingUnavailable = typeof BroadcastChannel === 'undefined';

  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  constructor() {
    if (!this.readingUnavailable) {
      const channel = new BroadcastChannel(readingChannelName(this.readingId));
      channel.onmessage = (event: MessageEvent<unknown>) => {
        if (event.data === 'privacyPolicy') {
          this.privacyPolicyRead.set(true);
        } else if (event.data === 'internalRules') {
          this.internalRulesRead.set(true);
        }
      };
      inject(DestroyRef).onDestroy(() => channel.close());
    }
  }

  protected readonly registrationForm = new FormBuilder().nonNullable.group(
    {
      associationName: [this.associationName],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      pronoun: new FormControl<RegisterInput.PronounEnum | ''>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      birthday: [''],
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

  protected rejectPrivacyPolicyBeforeReading(event: MouseEvent): void {
    if (!this.privacyPolicyRead()) {
      event.preventDefault();
      this.privacyPolicyCheckboxAttempted.set(true);
    }
  }

  protected rejectInternalRulesBeforeReading(event: MouseEvent): void {
    if (!this.internalRulesRead()) {
      event.preventDefault();
      this.internalRulesCheckboxAttempted.set(true);
    }
  }

  /** Validates the form and delegates registration to the inscription service. */
  protected submit(): void {
    this.submitted.set(true);
    this.registrationError.set(null);

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const values = this.registrationForm.getRawValue();
    if (!values.pronoun) {
      return;
    }

    this.authenticationService
      .register({
        associationName: values.associationName,
        name: values.lastName,
        firstName: values.firstName,
        email: values.email,
        password: values.password,
        pronoun: values.pronoun,
        phoneNumber: values.phone,
        birthday: values.birthday,
      })
      .subscribe({
        next: () =>
          void this.router.navigate(['/connexion'], {
            state: { registrationSuccess: true },
          }),
        error: (error) => {
          if (error.status === 409) {
            this.registrationError.set('Un compte existe déjà avec cette adresse e-mail.');
          } else if (error.status === 429) {
            this.registrationError.set(
              'Trop de tentatives. Veuillez patienter avant de réessayer.',
            );
          } else {
            this.registrationError.set(
              'Une erreur est survenue pendant l’inscription. Veuillez réessayer.',
            );
          }
        },
      });
  }
}
