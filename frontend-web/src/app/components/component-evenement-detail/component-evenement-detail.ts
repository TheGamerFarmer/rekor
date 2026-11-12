import { computed, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { evenements } from '../component-evenement/evenements.data';

@Component({
  imports: [Banner, Button],
  selector: 'app-component-evenement-detail',
  templateUrl: './component-evenement-detail.html',
  styleUrl: './component-evenement-detail.css',
})
export class ComponentEvenementDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap);

  protected readonly event = computed(() => {
    const slug = this.params()?.get('slug');
    return evenements.find((event) => event.slug === slug);
  });
}
