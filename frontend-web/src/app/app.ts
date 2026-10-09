import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { HealthService } from './api';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend-web');

  private readonly health = inject(HealthService);

  protected readonly backendStatus = toSignal(
    this.health.getHealth().pipe(
      map((response) => response.status),
      catchError(() => of('indisponible')),
    ),
  );
}
