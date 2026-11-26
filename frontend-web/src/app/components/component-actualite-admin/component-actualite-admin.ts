import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ASSOCIATION_NAME } from '../../constants';
import { ActualiteService } from '../../services/actualite.service';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';

@Component({
  imports: [Banner, Button, ReactiveFormsModule],
  selector: 'app-component-actualite-admin',
  templateUrl: './component-actualite-admin.html',
  styleUrl: '../component-evenement-admin/component-evenement-admin.css',
})
export class ComponentActualiteAdmin {
  private readonly router = inject(Router);
  private readonly actualiteService = inject(ActualiteService);
  protected readonly saveError = signal(false);
  protected readonly newsForm = new FormBuilder().nonNullable.group({
    titre: ['', [Validators.required, Validators.pattern(/\S/)]],
    summary: ['', [Validators.required, Validators.pattern(/\S/)]],
    image: ['', [Validators.required, Validators.pattern(/\S/)]],
    date: ['', Validators.required],
    corps: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  protected save(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    try {
      this.actualiteService.add({
        ...this.newsForm.getRawValue(),
        association: ASSOCIATION_NAME,
      });
    } catch (error) {
      console.error("Impossible d'enregistrer l'actualité.", error);
      this.saveError.set(true);
      return;
    }
    void this.router.navigate(['/actualites']);
  }
}
