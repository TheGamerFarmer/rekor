import { computed, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { ActualiteService } from '../../services/actualite.service';

@Component({
  imports: [Banner, Button, DatePipe],
  selector: 'app-component-actualite-detail',
  templateUrl: './component-actualite-detail.html',
  styleUrl: './component-actualite-detail.css',
})
export class ComponentActualiteDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly actualiteService = inject(ActualiteService);
  private readonly params = toSignal(this.route.paramMap);

  /** Resolves the news item identified by the route ID. */
  protected readonly actualite = computed(() => {
    const id = Number(this.params()?.get('id'));
    return Number.isInteger(id) ? this.actualiteService.findById(id) : undefined;
  });
}
