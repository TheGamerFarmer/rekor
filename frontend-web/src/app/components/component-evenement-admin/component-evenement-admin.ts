import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { EvenementService } from '../../services/evenement.service';
import { getHeureEvenement, type EvenementType } from '../component-evenement/evenements.data';

@Component({
  imports: [Banner, Button, ReactiveFormsModule],
  selector: 'app-component-evenement-admin',
  templateUrl: './component-evenement-admin.html',
  styleUrl: './component-evenement-admin.css',
})
export class ComponentEvenementAdmin {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evenementService = inject(EvenementService);
  protected readonly isEditing = signal(false);
  protected readonly eventTypes = [
    'Entraînement',
    'Match amical',
    'Match compétitif',
    'Réunion',
    'Autre',
  ] as const;

  protected readonly eventForm = new FormBuilder().nonNullable.group({
    name: ['', [Validators.required]],
    type: ['Entraînement', [Validators.required]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    place: ['', [Validators.required]],
    group: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  /** Initializes the form with the event addressed by the edit route. */
  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const evenement =
      id !== null && Number.isInteger(id) ? this.evenementService.findById(id) : undefined;

    if (evenement) {
      this.isEditing.set(true);
      this.eventForm.patchValue({
        ...evenement,
        date: evenement.date.split('T')[0],
        time: getHeureEvenement(evenement.date),
      });
    }
  }

  /** Validates the form and delegates creation or update to the event service. */
  protected save(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const { date, time, ...values } = this.eventForm.getRawValue();
    const eventValues = {
      ...values,
      date: `${date}T${time}`,
      type: values.type as EvenementType,
    };
    const idParam = this.route.snapshot.paramMap.get('id');
    const existingId = idParam === null ? null : Number(idParam);
    if (existingId !== null && Number.isInteger(existingId)) {
      if (!this.evenementService.findById(existingId)) {
        void this.router.navigate(['/admin/evenements']);
        return;
      }
      this.evenementService.update(existingId, eventValues);
    } else {
      this.evenementService.add(eventValues);
    }

    void this.router.navigate(['/admin/evenements']);
  }
}
