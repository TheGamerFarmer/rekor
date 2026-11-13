import { Injectable, signal } from '@angular/core';
import {
  defaultEvenements,
  type Evenement,
} from '../components/component-evenement/evenements.data';

const EVENTS_STORAGE_KEY = 'rekor-evenements';

@Injectable({ providedIn: 'root' })
export class EvenementService {
  private readonly events = signal<Evenement[]>(this.readStoredEvenements());
  readonly evenements = this.events.asReadonly();

  /** Adds an event, assigns its identifier and persists the new collection. */
  add(values: Omit<Evenement, 'id' | 'slug'>): void {
    const evenement: Evenement = {
      id: this.getNextId(),
      slug: this.createSlug(values.name),
      ...values,
    };
    this.updateEvents([...this.events(), evenement]);
  }

  /** Updates an existing event without changing its stable identifier or URL. */
  update(slug: string, values: Omit<Evenement, 'id' | 'slug'>): void {
    const current = this.events().find((evenement) => evenement.slug === slug);
    if (!current) {
      return;
    }

    this.updateEvents(
      this.events().map((evenement) =>
        evenement.slug === slug ? { ...current, ...values } : evenement,
      ),
    );
  }

  /** Removes an event by identifier and persists the collection. */
  remove(id: number): void {
    this.updateEvents(this.events().filter((evenement) => evenement.id !== id));
  }

  /** Finds an event by its URL slug. */
  findBySlug(slug: string): Evenement | undefined {
    return this.events().find((evenement) => evenement.slug === slug);
  }

  /** Replaces the signal value and synchronizes browser storage. */
  private updateEvents(events: Evenement[]): void {
    this.events.set(events);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    }
  }

  /** Loads validated events from browser storage, falling back to defaults. */
  private readStoredEvenements(): Evenement[] {
    if (typeof localStorage === 'undefined') {
      return [...defaultEvenements];
    }

    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!stored) {
      return [...defaultEvenements];
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed) || !parsed.every(isEvenement)) {
        return [...defaultEvenements];
      }

      const events = parsed.map(normalizeStoredEvenement);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return events;
    } catch {
      return [...defaultEvenements];
    }
  }

  /** Calculates the next available numeric event identifier. */
  private getNextId(): number {
    return Math.max(0, ...this.events().map(({ id }) => id)) + 1;
  }

  /** Creates a readable unique URL slug from an event name. */
  private createSlug(name: string): string {
    const baseSlug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const suffix = this.events().some((evenement) => evenement.slug === baseSlug)
      ? `-${this.getNextId()}`
      : '';
    return `${baseSlug}${suffix}`;
  }
}

/** Migrates legacy stored events by moving their old time value into date. */
function normalizeStoredEvenement(evenement: Evenement): Evenement {
  const storedEvenement = evenement as Evenement & { time?: unknown };
  const legacyTime = storedEvenement.time;
  const date =
    !evenement.date.includes('T') && typeof legacyTime === 'string'
      ? `${evenement.date}T${legacyTime}`
      : evenement.date;
  const withoutTime = { ...storedEvenement };
  delete withoutTime.time;

  return { ...withoutTime, date };
}

/** Checks that persisted data has the complete event shape. */
function isEvenement(value: unknown): value is Evenement {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const evenement = value as Record<string, unknown>;
  const participants = evenement['participants'];
  return (
    typeof evenement['id'] === 'number' &&
    typeof evenement['slug'] === 'string' &&
    typeof evenement['name'] === 'string' &&
    typeof evenement['type'] === 'string' &&
    typeof evenement['date'] === 'string' &&
    typeof evenement['place'] === 'string' &&
    typeof evenement['description'] === 'string' &&
    typeof evenement['group'] === 'string' &&
    (participants === undefined ||
      (Array.isArray(participants) && participants.every(isParticipant)))
  );
}

function isParticipant(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const participant = value as Record<string, unknown>;
  return (
    typeof participant['id'] === 'number' &&
    typeof participant['name'] === 'string' &&
    (participant['status'] === 'present' ||
      participant['status'] === 'absent' ||
      participant['status'] === 'pending')
  );
}
