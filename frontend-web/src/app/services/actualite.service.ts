import { Injectable, signal } from '@angular/core';
import { actualites, type Actualite } from '../components/component-actualite/actualites.data';

const NEWS_STORAGE_KEY = 'rekor-actualites';

@Injectable({ providedIn: 'root' })
export class ActualiteService {
  private readonly storageError = signal(false);
  private readonly news = signal<Actualite[]>(this.readActualites());
  readonly actualites = this.news.asReadonly();
  readonly hasStorageError = this.storageError.asReadonly();

  add(values: Omit<Actualite, 'id'>): void {
    if (this.storageError() || typeof localStorage === 'undefined') {
      throw new Error('Le stockage des actualités est indisponible.');
    }

    const id = Math.max(0, ...this.news().map((actualite) => actualite.id)) + 1;
    const news = [{ id, ...values }, ...this.news()];
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
    this.news.set(news);
  }

  findById(id: number): Actualite | undefined {
    return this.news().find((actualite) => actualite.id === id);
  }

  private readActualites(): Actualite[] {
    if (typeof localStorage === 'undefined') {
      return [...actualites];
    }

    try {
      const stored = localStorage.getItem(NEWS_STORAGE_KEY);
      if (stored === null) {
        return [...actualites];
      }
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed) || !parsed.every(isActualite)) {
        throw new Error('Les actualités enregistrées sont invalides.');
      }
      return parsed;
    } catch (error) {
      console.error('Impossible de charger les actualités enregistrées.', error);
      this.storageError.set(true);
      return [...actualites];
    }
  }
}

function isActualite(value: unknown): value is Actualite {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const news = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(news['id']) &&
    typeof news['titre'] === 'string' &&
    typeof news['summary'] === 'string' &&
    typeof news['image'] === 'string' &&
    typeof news['date'] === 'string' &&
    typeof news['association'] === 'string' &&
    typeof news['corps'] === 'string'
  );
}
