import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { EvenementService } from '../../services/evenement.service';
import {
  getDateDuJour,
  getHeureEvenement,
  type Evenement,
  type Participant,
  type ParticipantStatus,
} from '../component-evenement/evenements.data';

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
  protected readonly participantCategories = [
    { label: 'Présents', status: 'present' },
    { label: 'Absents', status: 'absent' },
    { label: 'En attente', status: 'pending' },
  ] as const satisfies readonly { label: string; status: ParticipantStatus }[];

  protected readonly filteredEvenements = computed(() => {
    this.clockTick();
    const today = this.getToday();
    const isPast = this.eventFilter() === 'past';
    return this.evenements().filter((evenement) =>
      isPast ? evenement.date < today : evenement.date >= today,
    );
  });

  /** Returns participants in the requested attendance category. */
  protected getParticipants(evenement: Evenement, status: ParticipantStatus): Participant[] {
    return evenement.participants?.filter((participant) => participant.status === status) ?? [];
  }

  /** Returns the hour stored in the event date-time value. */
  protected getHeureEvenement(date: string): string {
    return getHeureEvenement(date);
  }

  /** Changes the active status filter in the administration list. */
  protected setFilter(filter: 'past' | 'upcoming'): void {
    this.eventFilter.set(filter);
  }

  /** Returns today's local date in the event storage format. */
  private getToday(): string {
    return getDateDuJour();
  }

  /** Deletes an event through the shared event service. */
  protected deleteEvenement(id: number): void {
    this.evenementService.remove(id);
  }
}
