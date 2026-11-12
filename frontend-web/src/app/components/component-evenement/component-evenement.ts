import { Component, computed, input, signal } from '@angular/core';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { evenements, type Evenement } from './evenements.data';

const PAGE_SIZE = 5;

@Component({
  imports: [Banner, Button],
  selector: 'app-component-evenement',
  templateUrl: './component-evenement.html',
  styleUrl: './component-evenement.css',
})
export class ComponentEvenement {
  protected readonly events = input<readonly Evenement[]>(evenements);
  protected readonly currentPage = signal(1);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.events().length / PAGE_SIZE)),
  );
  protected readonly activePage = computed(() => Math.min(this.currentPage(), this.pageCount()));
  protected readonly visiblePages = computed(() => {
    const total = this.pageCount();
    const start = Math.max(1, Math.min(this.activePage() - 2, total - 4));
    const end = Math.min(total, start + 4);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });
  protected readonly visibleEvents = computed(() => {
    const start = (this.activePage() - 1) * PAGE_SIZE;
    return this.events().slice(start, start + PAGE_SIZE);
  });

  protected goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.pageCount())));
  }
}
