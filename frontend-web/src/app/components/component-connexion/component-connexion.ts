import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [Banner, Button, ReactiveFormsModule, RouterLink],
  selector: 'app-component-connexion',
  styleUrl: './component-connexion.css',
  templateUrl: './component-connexion.html',
})
export class ComponentConnexion {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);
  protected readonly loginError = signal<string | null>(null);

  protected readonly loginForm = new FormBuilder().nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  /** Marks the login attempt and exposes validation errors when needed. */
  protected submit(): void {
    this.submitted.set(true);
    this.loginError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => void this.router.navigate(['/compte']),
      error: () => this.loginError.set('E-mail ou mot de passe incorrect.'),
    });
  }
}
