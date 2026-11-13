import { computed, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { getHeureEvenement } from '../component-evenement/evenements.data';
import { EvenementService } from '../../services/evenement.service';

@Component({
  imports: [Banner, Button, DatePipe],
  selector: 'app-component-evenement-details',
  templateUrl: './component-evenement-details.html',
  styleUrl: './component-evenement-details.css',
})
export class ComponentEvenementDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly evenementService = inject(EvenementService);
  private readonly params = toSignal(this.route.paramMap);

  /** Resolves the event identified by the route slug. */
  protected readonly evenement = computed(() => {
    const slug = this.params()?.get('slug');
    return slug ? this.evenementService.findBySlug(slug) : undefined;
  });

  /** Returns the hour stored in the event date-time value. */
  protected getHeureEvenement(date: string): string {
    return getHeureEvenement(date);
  }
}
