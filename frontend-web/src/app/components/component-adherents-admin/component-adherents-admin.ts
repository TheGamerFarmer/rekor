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
  MEMBER_PRONOUNS,
  MEMBER_ROLES,
  type Adherent,
  type AdherentInput,
  type MemberPronoun,
  type MemberRole,
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
  protected readonly registrationFilter = signal<RegistrationStatus>('to-validate');
  protected readonly editingId = signal<number | null>(null);
  protected readonly isFormVisible = signal(false);
  protected readonly submitted = signal(false);
  protected readonly currentDate = this.formatDate(new Date());
  protected readonly pronouns = MEMBER_PRONOUNS;
  protected readonly roles = MEMBER_ROLES;
  protected readonly statuses = [
    { value: 'validated', label: 'Validées' },
    { value: 'pending-validation', label: 'En cours de validation' },
    { value: 'to-validate', label: 'À valider' },
  ] as const satisfies readonly { value: RegistrationStatus; label: string }[];

  protected readonly filteredAdherents = computed(() =>
    this.adherents().filter((member) => member.registrationStatus === this.registrationFilter()),
  );

  protected readonly memberForm = new FormBuilder().nonNullable.group({
    lastName: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    pronoun: new FormControl<MemberPronoun>('Iel', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birthDate: ['', [Validators.required, this.validateBirthDate]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+().\s-]{6,20}$/)]],
    email: ['', [Validators.required, Validators.email]],
    roles: new FormControl<MemberRole[]>([], {
      nonNullable: true,
      validators: [Validators.required],
    }),
    registrationStatus: new FormControl<RegistrationStatus>('to-validate', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected getCount(status: RegistrationStatus): number {
    return this.adherents().filter((member) => member.registrationStatus === status).length;
  }

  protected setFilter(status: RegistrationStatus): void {
    this.registrationFilter.set(status);
    this.closeForm();
  }

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
      roles: [...member.roles],
      registrationStatus: member.registrationStatus,
    });
    this.isFormVisible.set(true);
  }

  protected toggleRole(role: MemberRole, checked: boolean): void {
    const selected = this.memberForm.controls.roles.value;
    this.memberForm.controls.roles.setValue(
      checked ? [...selected, role] : selected.filter((item) => item !== role),
    );
    this.memberForm.controls.roles.markAsTouched();
  }

  protected onRoleChange(role: MemberRole, event: Event): void {
    const checkbox = event.currentTarget;
    if (checkbox instanceof HTMLInputElement) {
      this.toggleRole(role, checkbox.checked);
    }
  }

  protected hasRole(role: MemberRole): boolean {
    return this.memberForm.controls.roles.value.includes(role);
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    const values: AdherentInput = this.memberForm.getRawValue();
    const id = this.editingId();
    if (id !== null) {
      this.adherentService.update(id, values);
    }
    this.closeForm();
  }

  protected deleteMember(id: number): void {
    this.adherentService.remove(id);
  }

  protected closeForm(): void {
    this.isFormVisible.set(false);
    this.editingId.set(null);
    this.submitted.set(false);
    this.memberForm.reset();
  }

  private validateBirthDate(control: AbstractControl<string>): ValidationErrors | null {
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
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
