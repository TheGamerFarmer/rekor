import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';

@Component({
  imports: [Banner, Button, ReactiveFormsModule, RouterLink],
  selector: 'app-component-connexion',
  styleUrl: './component-connexion.css',
  templateUrl: './component-connexion.html',
})
export class ComponentConnexion {
  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);

  protected readonly loginForm = new FormBuilder().nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  /** Marks the login attempt and exposes validation errors when needed. */
  protected submit(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    }
  }
}
