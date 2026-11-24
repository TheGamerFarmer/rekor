import { Injectable, signal } from '@angular/core';

export const MEMBER_ROLES = [
  'Administrateur',
  'Entraineur',
  'Capitaine',
  'Adhérent',
  'Visiteur',
] as const;
export type MemberRole = string;

export const REGISTRATION_STATUSES = [
  'validated',
  'pending-validation',
  'to-validate',
  'refused',
] as const;
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
  role: MemberRole;
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
    role: 'Capitaine',
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
    role: 'Visiteur',
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
    role: 'Entraineur',
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
    role: 'Visiteur',
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
    role: 'Adhérent',
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
    this.updateMembers([...this.members(), { ...values, id }]);
  }

  /** Updates a member while preserving their identifier. */
  update(id: number, values: AdherentInput): void {
    this.updateMembers(
      this.members().map((member) => (member.id === id ? { ...values, id } : member)),
    );
  }

  /** Removes a member and persists the updated collection. */
  remove(id: number): void {
    this.updateMembers(this.members().filter((member) => member.id !== id));
  }

  /** Updates the member signal and stores the resulting collection. */
  private updateMembers(members: Adherent[]): void {
    this.members.set(members);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
  }

  /** Loads members from browser storage, using the fixtures when storage is empty. */
  private readStoredMembers(): Adherent[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!stored) {
      return MOCK_ADHERENTS.map((member) => ({ ...member }));
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

/** Migrates a stored member from the legacy birth-year and roles fields. */
function migrateLegacyAdherent(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const member = value as Record<string, unknown>;
  const legacyMember = { ...member };
  if ('birthYear' in legacyMember && !('birthDate' in legacyMember)) {
    legacyMember['birthDate'] = null;
    delete legacyMember['birthYear'];
  }

  if (!('role' in legacyMember) && Array.isArray(legacyMember['roles'])) {
    const roles: unknown[] = legacyMember['roles'];
    const normalized = roles.map((role) => (role === 'Entraîneur' ? 'Entraineur' : role));
    const knownRole = MEMBER_ROLES.find((role) => normalized.includes(role));
    legacyMember['role'] = knownRole ?? (normalized.length === 1 ? normalized[0] : undefined);
    delete legacyMember['roles'];
  }
  return legacyMember;
}

/** Checks whether persisted data matches the current member model. */
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
    typeof member['role'] === 'string' &&
    member['role'].trim().length > 0 &&
    REGISTRATION_STATUSES.includes(member['registrationStatus'] as RegistrationStatus)
  );
}
