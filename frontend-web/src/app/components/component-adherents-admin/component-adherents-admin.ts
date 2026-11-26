import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  type AbstractControl,
} from '@angular/forms';
import { Banner } from '../component-banner/banner';
import { Button } from '../component-button/button';
import {
  AdherentService,
  isValidConfirmationDate,
  MAX_PAYMENT_DOCUMENT_SIZE,
  MEMBER_PRONOUNS,
  MEMBER_ROLES,
  type Adherent,
  type MemberPronoun,
  type MemberRole,
  type PaymentDocument,
  type RegistrationStatus,
} from '../../services/adherent.service';

@Component({
  imports: [Banner, Button, DatePipe, ReactiveFormsModule],
  selector: 'app-component-adherents-admin',
  templateUrl: './component-adherents-admin.html',
  styleUrl: './component-adherents-admin.css',
})
export class ComponentAdherentsAdmin {
  private readonly adherentService = inject(AdherentService);
  protected readonly adherents = this.adherentService.adherents;
  protected readonly registrationFilter = signal<RegistrationStatus>('pending');
  protected readonly editingId = signal<number | null>(null);
  protected readonly isFormVisible = signal(false);
  protected readonly submitted = signal(false);
  protected readonly paymentErrors = signal<Record<number, string>>({});
  protected readonly paymentSaving = signal<ReadonlySet<number>>(new Set());
  protected readonly currentDate = this.formatDate(new Date());
  protected readonly pronouns = MEMBER_PRONOUNS;
  protected readonly roles: readonly MemberRole[] = MEMBER_ROLES;
  protected readonly statuses = [
    { value: 'finalized', label: 'Finalisées' },
    { value: 'validated', label: 'Validées' },
    { value: 'pending', label: 'En attente' },
    { value: 'refused', label: 'Refusées' },
  ] as const satisfies readonly { value: RegistrationStatus; label: string }[];

  protected readonly filteredAdherents = computed(() =>
    this.adherents().filter((member) => member.registrationStatus === this.registrationFilter()),
  );

  /** Validates an optional birth date and rejects dates outside the supported range. */
  private readonly validateBirthDate = (
    control: AbstractControl<string>,
  ): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const date = new Date(`${value}T00:00:00`);
    const [year, month, day] = value.split('-').map(Number);
    const isValidDate =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return isValidDate && value >= '1900-01-01' && value <= this.currentDate
      ? null
      : { invalidBirthDate: true };
  };

  protected readonly memberForm = new FormBuilder().nonNullable.group({
    lastName: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    pronoun: new FormControl<MemberPronoun>('Iel', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birthDate: ['', [this.validateBirthDate]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+().\s-]{6,20}$/)]],
    email: ['', [Validators.required, Validators.email]],
    role: new FormControl<MemberRole>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    registrationStatus: new FormControl<RegistrationStatus>('pending', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  /** Counts members with the requested registration status. */
  protected getCount(status: RegistrationStatus): number {
    return this.adherents().filter((member) => member.registrationStatus === status).length;
  }

  /** Changes the registration filter and closes any open edit form. */
  protected setFilter(status: RegistrationStatus): void {
    this.registrationFilter.set(status);
    this.closeForm();
  }

  /** Populates the form with the selected member and opens it for editing. */
  protected startEdit(member: Adherent): void {
    this.editingId.set(member.id);
    this.submitted.set(false);
    this.memberForm.patchValue({
      lastName: member.lastName,
      firstName: member.firstName,
      pronoun: member.pronoun,
      birthDate: member.birthDate ?? '',
      phone: member.phone,
      email: member.email,
      role: member.role,
      registrationStatus: member.registrationStatus,
    });
    this.isFormVisible.set(true);
  }

  /** Validates and saves the current member changes. */
  protected save(): void {
    this.submitted.set(true);
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    const values = this.memberForm.getRawValue();
    const id = this.editingId();
    if (id !== null) {
      this.adherentService.update(id, {
        ...values,
        birthDate: values.birthDate || null,
      });
    }
    this.closeForm();
  }

  /** Removes the selected member from the shared collection. */
  protected deleteMember(id: number): void {
    this.adherentService.remove(id);
  }

  protected async confirmPayment(
    member: Adherent,
    dateInput: HTMLInputElement,
    commentInput: HTMLTextAreaElement,
    documentInput: HTMLInputElement,
  ): Promise<void> {
    if (this.paymentSaving().has(member.id)) return;
    this.paymentErrors.update((errors) => ({ ...errors, [member.id]: '' }));
    if (!isValidConfirmationDate(dateInput.value)) {
      dateInput.setCustomValidity('Saisissez une date valide qui ne soit pas dans le futur.');
      dateInput.reportValidity();
      dateInput.setCustomValidity('');
      return;
    }

    const file = documentInput.files?.[0];
    if (
      file &&
      (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) ||
        file.size > MAX_PAYMENT_DOCUMENT_SIZE)
    ) {
      this.paymentErrors.update((errors) => ({
        ...errors,
        [member.id]: 'Le justificatif doit être un PDF, JPEG ou PNG de 1 Mo maximum.',
      }));
      return;
    }

    const date = dateInput.value;
    const comment = commentInput.value.trim();
    this.paymentSaving.update((saving) => new Set(saving).add(member.id));
    try {
      const document = file ? await this.readPaymentDocument(file) : null;
      this.adherentService.confirmPayment(member.id, date, { comment, document });
    } catch {
      this.paymentErrors.update((errors) => ({
        ...errors,
        [member.id]:
          'Impossible de confirmer le paiement ou d’enregistrer le justificatif. Vérifiez le fichier et l’espace disponible dans votre navigateur.',
      }));
    } finally {
      this.paymentSaving.update((saving) => {
        const next = new Set(saving);
        next.delete(member.id);
        return next;
      });
    }
  }

  protected downloadPaymentDocument(document: PaymentDocument): void {
    const [header, base64] = document.data.split(',');
    const mimeType = header.slice(5, header.indexOf(';'));
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  private readPaymentDocument(file: File): Promise<PaymentDocument> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve({ name: file.name, data: reader.result });
        } else {
          reject(new Error('Lecture du justificatif impossible.'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.onabort = () => reject(new Error('Lecture du justificatif interrompue.'));
      reader.readAsDataURL(file);
    });
  }

  /** Resets and hides the member form. */
  protected closeForm(): void {
    this.isFormVisible.set(false);
    this.editingId.set(null);
    this.submitted.set(false);
    this.memberForm.reset();
  }

  /** Formats a date as the local YYYY-MM-DD value used by date inputs. */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
