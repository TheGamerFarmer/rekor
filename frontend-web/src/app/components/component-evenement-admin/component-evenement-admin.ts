import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import { EvenementService } from '../../services/evenement.service';
import type { EvenementType } from '../component-evenement/evenements.data';

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
    const slug = this.route.snapshot.paramMap.get('slug');
    const evenement = slug ? this.evenementService.findBySlug(slug) : undefined;

    if (evenement) {
      this.isEditing.set(true);
      this.eventForm.patchValue(evenement);
    }
  }

  /** Validates the form and delegates creation or update to the event service. */
  protected save(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const values = this.eventForm.getRawValue();
    const existingSlug = this.route.snapshot.paramMap.get('slug');
    if (existingSlug) {
      if (!this.evenementService.findBySlug(existingSlug)) {
        void this.router.navigate(['/admin/evenements']);
        return;
      }
      this.evenementService.update(existingSlug, {
        ...values,
        type: values.type as EvenementType,
      });
    } else {
      this.evenementService.add({
        ...values,
        type: values.type as EvenementType,
      });
    }

    void this.router.navigate(['/admin/evenements']);
  }
}
