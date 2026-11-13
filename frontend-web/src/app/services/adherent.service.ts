import { Injectable, signal } from '@angular/core';

export const MEMBER_ROLES = ['Administrateur', 'Entraîneur', 'Capitaine', 'Adhérent'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const REGISTRATION_STATUSES = ['validated', 'pending-validation', 'to-validate'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const MEMBER_PRONOUNS = ['Il', 'Elle', 'Iel', 'Autre'] as const;
export type MemberPronoun = (typeof MEMBER_PRONOUNS)[number];

export interface Adherent {
  id: number;
  lastName: string;
  firstName: string;
  pronoun: MemberPronoun;
  birthDate: string | null;
  phone: string;
  email: string;
  roles: MemberRole[];
  registrationStatus: RegistrationStatus;
}

export type AdherentInput = Omit<Adherent, 'id'>;

const MEMBERS_STORAGE_KEY = 'rekor-adherents';

@Injectable({ providedIn: 'root' })
export class AdherentService {
  private readonly members = signal<Adherent[]>(this.readStoredMembers());
  readonly adherents = this.members.asReadonly();

  /** Adds a member and persists the updated collection. */
  add(values: AdherentInput): void {
    const id = Math.max(0, ...this.members().map((member) => member.id)) + 1;
    this.updateMembers([...this.members(), { ...values, roles: [...values.roles], id }]);
  }

  /** Updates a member while preserving their identifier. */
  update(id: number, values: AdherentInput): void {
    this.updateMembers(
      this.members().map((member) =>
        member.id === id ? { ...values, roles: [...values.roles], id } : member,
      ),
    );
  }

  /** Removes a member and persists the updated collection. */
  remove(id: number): void {
    this.updateMembers(this.members().filter((member) => member.id !== id));
  }

  private updateMembers(members: Adherent[]): void {
    this.members.set(members);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
  }

  private readStoredMembers(): Adherent[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const members = parsed.map(migrateLegacyAdherent);
      return members.every(isAdherent) ? members : [];
    } catch {
      return [];
    }
  }
}

function migrateLegacyAdherent(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const member = value as Record<string, unknown>;
  if (!('birthYear' in member) || 'birthDate' in member) {
    return value;
  }

  const { birthYear: _birthYear, ...legacyMember } = member;
  return { ...legacyMember, birthDate: null };
}

function isAdherent(value: unknown): value is Adherent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const member = value as Record<string, unknown>;
  return (
    typeof member['id'] === 'number' &&
    typeof member['lastName'] === 'string' &&
    typeof member['firstName'] === 'string' &&
    MEMBER_PRONOUNS.includes(member['pronoun'] as MemberPronoun) &&
    (typeof member['birthDate'] === 'string' || member['birthDate'] === null) &&
    typeof member['phone'] === 'string' &&
    typeof member['email'] === 'string' &&
    Array.isArray(member['roles']) &&
    member['roles'].every((role: unknown) => MEMBER_ROLES.includes(role as MemberRole)) &&
    REGISTRATION_STATUSES.includes(member['registrationStatus'] as RegistrationStatus)
  );
}
