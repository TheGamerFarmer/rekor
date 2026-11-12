import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Button } from './components/component-button/button';
import { AuthService } from './services/auth.service';

@Component({
  imports: [Button, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Ends the current session from the site header. */
  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/accueil']);
  }
}
