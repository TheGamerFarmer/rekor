import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { HealthService } from '../api';
import { Banner } from '../component-banner/banner';

@Component({
  imports: [Banner],
  selector: 'app-component-accueil',
  styleUrl: './component-accueil.css',
  templateUrl: './component-accueil.html',
})
export class ComponentAccueil {
  protected readonly title = signal('frontend-web');

  private readonly health = inject(HealthService);

  protected readonly backendStatus = toSignal(
    this.health.getHealth().pipe(
      map((response) => response.status),
      catchError(() => of('indisponible')),
    ),
  );
}
