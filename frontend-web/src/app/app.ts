import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Button } from './components/component-button/button';
import { AuthService } from './services/auth.service';
import { UserDetails } from './api/model/userDetails';

@Component({
  imports: [Button, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly roles = UserDetails.RoleEnum;
  private readonly router = inject(Router);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.authService.loadRole().subscribe({ error: () => undefined });
    }
  }

  /** Ends the current session. */
  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/accueil']);
  }
}
