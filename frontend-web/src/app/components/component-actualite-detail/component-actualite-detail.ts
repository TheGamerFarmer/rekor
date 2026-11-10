import { computed, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { actualites } from '../component-actualite/actualites.data';

@Component({
  imports: [Banner, Button],
  selector: 'app-component-actualite-detail',
  templateUrl: './component-actualite-detail.html',
  styleUrl: './component-actualite-detail.css',
})
export class ComponentActualiteDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap);

  protected readonly actualite = computed(() => {
    const slug = this.params()?.get('slug');
    return actualites.find((actualite) => actualite.slug === slug);
  });
}
