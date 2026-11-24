import { Injectable, signal } from '@angular/core';

export const MEMBER_ROLES = [
  'Administrateur',
  'Entraîneur',
  'Capitaine',
  'Adhérent',
  'Visiteur',
] as const;
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

const MOCK_ADHERENTS: Adherent[] = [
  {
    id: 1,
    lastName: 'Martin',
    firstName: 'Alex',
    pronoun: 'Iel',
    birthDate: '2000-05-12',
    phone: '0600000001',
    email: 'alex.martin@example.fr',
    roles: ['Adhérent', 'Capitaine'],
    registrationStatus: 'validated',
  },
  {
    id: 2,
    lastName: 'Durand',
    firstName: 'Sam',
    pronoun: 'Il',
    birthDate: '1998-11-03',
    phone: '0600000002',
    email: 'sam.durand@example.fr',
    roles: ['Adhérent'],
    registrationStatus: 'to-validate',
  },
  {
    id: 3,
    lastName: 'Bernard',
    firstName: 'Camille',
    pronoun: 'Elle',
    birthDate: '2002-02-21',
    phone: '0600000003',
    email: 'camille.bernard@example.fr',
    roles: ['Entraîneur'],
    registrationStatus: 'pending-validation',
  },
  {
    id: 4,
    lastName: 'Petit',
    firstName: 'Noa',
    pronoun: 'Autre',
    birthDate: null,
    phone: '0600000004',
    email: 'noa.petit@example.fr',
    roles: ['Adhérent'],
    registrationStatus: 'to-validate',
  },
  {
    id: 5,
    lastName: 'Robert',
    firstName: 'Lina',
    pronoun: 'Elle',
    birthDate: '1995-08-17',
    phone: '0600000005',
    email: 'lina.robert@example.fr',
    roles: ['Adhérent'],
    registrationStatus: 'validated',
  },
];

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
      return MOCK_ADHERENTS.map((member) => ({ ...member, roles: [...member.roles] }));
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

  const legacyMember = { ...member };
  delete legacyMember['birthYear'];
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
