import { Component, computed, input, signal } from '@angular/core';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { actualites, type Actualite } from './actualites.data';

const PAGE_SIZE = 2;

@Component({
  imports: [Banner, Button],
  selector: 'app-component-actualite',
  templateUrl: './component-actualite.html',
  styleUrl: './component-actualite.css',
})
export class ComponentActualite {
  protected readonly actualites = input<readonly Actualite[]>(actualites);
  protected readonly currentPage = signal(1);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.actualites().length / PAGE_SIZE)),
  );
  protected readonly activePage = computed(() => Math.min(this.currentPage(), this.pageCount()));
  protected readonly visiblePages = computed(() => {
    const total = this.pageCount();
    const start = Math.max(1, Math.min(this.activePage() - 2, total - 4));
    const end = Math.min(total, start + 4);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });
  protected readonly visibleActualites = computed(() => {
    const start = (this.activePage() - 1) * PAGE_SIZE;
    return this.actualites().slice(start, start + PAGE_SIZE);
  });

  /** Moves to a valid page and keeps pagination inside its available range. */
  protected goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.pageCount())));
  }
}
