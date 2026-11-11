import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { EvenementService } from '../../services/evenement.service';

@Component({
  imports: [Banner, Button, DatePipe],
  selector: 'app-component-evenements-admin',
  templateUrl: './component-evenements-admin.html',
  styleUrl: './component-evenements-admin.css',
})
export class ComponentEvenementsAdmin {
  private readonly evenementService = inject(EvenementService);
  protected readonly evenements = this.evenementService.evenements;
  protected readonly eventFilter = signal<'past' | 'upcoming'>('upcoming');
  private readonly clockTick = toSignal(interval(60_000), { initialValue: 0 });

  protected readonly filteredEvenements = computed(() => {
    this.clockTick();
    const today = this.getToday();
    const isPast = this.eventFilter() === 'past';
    return this.evenements().filter((evenement) =>
      isPast ? evenement.date < today : evenement.date >= today,
    );
  });

  /** Changes the active status filter in the administration list. */
  protected setFilter(filter: 'past' | 'upcoming'): void {
    this.eventFilter.set(filter);
  }

  /** Returns today's local date in the event storage format. */
  private getToday(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Deletes an event through the shared event service. */
  protected deleteEvenement(id: number): void {
    this.evenementService.remove(id);
  }
}
