import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { getNomGymnase } from './evenements.data';
import { EvenementService } from '../../services/evenement.service';

const PAGE_SIZE = 6;

@Component({
  imports: [Banner, Button, DatePipe],
  selector: 'app-component-evenement',
  templateUrl: './component-evenement.html',
  styleUrl: './component-evenement.css',
})
export class ComponentEvenement {
  private readonly evenementService = inject(EvenementService);
  protected readonly evenements = this.evenementService.evenements;
  protected readonly eventFilter = signal<'past' | 'upcoming'>('upcoming');
  protected readonly currentPage = signal(1);
  private readonly clockTick = toSignal(interval(60_000), { initialValue: 0 });
  protected readonly filteredEvenements = computed(() => {
    this.clockTick();
    const today = this.getToday();
    const isPast = this.eventFilter() === 'past';
    return this.evenements().filter((evenement) =>
      isPast ? evenement.date < today : evenement.date >= today,
    );
  });
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredEvenements().length / PAGE_SIZE)),
  );
  protected readonly visibleEvenements = computed(() => {
    const start = (Math.min(this.currentPage(), this.pageCount()) - 1) * PAGE_SIZE;
    return this.filteredEvenements().slice(start, start + PAGE_SIZE);
  });

  /** Changes the active event status filter and resets pagination. */
  protected setFilter(filter: 'past' | 'upcoming'): void {
    this.eventFilter.set(filter);
    this.currentPage.set(1);
  }

  /** Moves to a page while keeping the page number within the available range. */
  protected goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.pageCount())));
  }

  /** Returns only the venue name from the full stored address. */
  protected getNomGymnase(adresse: string): string {
    return getNomGymnase(adresse);
  }

  /** Returns today's local date in the same format as stored event dates. */
  private getToday(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
