import { Injectable, signal } from '@angular/core';

export const MEMBER_ROLES = [
  'Administrateur',
  'Entraineur',
  'Capitaine',
  'Adhérent',
  'Visiteur',
] as const;
export type MemberRole = string;

export const REGISTRATION_STATUSES = ['finalized', 'validated', 'pending', 'refused'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const MEMBER_PRONOUNS = ['Il', 'Elle', 'Iel', 'Autre'] as const;
export type MemberPronoun = (typeof MEMBER_PRONOUNS)[number];

export const MAX_PAYMENT_DOCUMENT_SIZE = 1024 * 1024;
export interface PaymentDocument {
  name: string;
  data: string;
}

export interface PaymentDetails {
  comment: string;
  document: PaymentDocument | null;
}

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
  medicalCertificate: boolean | null;
  medicalCertificateReceivedDate: string | null;
  membershipPaymentDate: string | null;
  paymentDetails?: PaymentDetails;
  rightOfPublicity: boolean | null;
}

export type AdherentInput = Omit<
  Adherent,
  | 'id'
  | 'medicalCertificate'
  | 'medicalCertificateReceivedDate'
  | 'membershipPaymentDate'
  | 'paymentDetails'
  | 'rightOfPublicity'
>;

function isValidStoredDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01') return false;
  const date = new Date(`${value}T00:00:00`);
  const [year, month, day] = value.split('-').map(Number);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isValidConfirmationDate(value: string): boolean {
  if (!isValidStoredDate(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

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
    registrationStatus: 'finalized',
    medicalCertificate: true,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: true,
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
    registrationStatus: 'pending',
    medicalCertificate: true,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: false,
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
    registrationStatus: 'validated',
    medicalCertificate: false,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: true,
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
    registrationStatus: 'pending',
    medicalCertificate: null,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: null,
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
    registrationStatus: 'finalized',
    medicalCertificate: true,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: false,
  },
  {
    id: 6,
    lastName: 'Leroy',
    firstName: 'Lou',
    pronoun: 'Iel',
    birthDate: '2001-04-10',
    phone: '0600000006',
    email: 'lou.leroy@example.fr',
    role: 'Adhérent',
    registrationStatus: 'validated',
    medicalCertificate: true,
    medicalCertificateReceivedDate: null,
    membershipPaymentDate: null,
    rightOfPublicity: true,
  },
];

@Injectable({ providedIn: 'root' })
export class AdherentService {
  private readonly members = signal<Adherent[]>(this.readStoredMembers());
  readonly adherents = this.members.asReadonly();

  /** Adds a member and persists the updated collection. */
  add(values: AdherentInput): void {
    if (values.registrationStatus === 'finalized') {
      throw new Error('Une inscription ne peut être finalisée sans certificat et paiement.');
    }
    const id = Math.max(0, ...this.members().map((member) => member.id)) + 1;
    this.updateMembers([
      ...this.members(),
      {
        ...values,
        id,
        medicalCertificate: null,
        medicalCertificateReceivedDate: null,
        membershipPaymentDate: null,
        rightOfPublicity: null,
      },
    ]);
  }

  /** Updates a member while preserving their identifier. */
  update(id: number, values: AdherentInput): void {
    const member = this.members().find((item) => item.id === id);
    if (
      member &&
      member.registrationStatus !== 'finalized' &&
      values.registrationStatus === 'finalized'
    ) {
      throw new Error('Une inscription ne peut être finalisée sans certificat et paiement.');
    }
    this.updateMembers(
      this.members().map((member) => (member.id === id ? { ...member, ...values } : member)),
    );
  }

  confirmPayment(id: number, date: string, paymentDetails?: PaymentDetails): void {
    const member = this.members().find((item) => item.id === id);
    if (!member || member.registrationStatus !== 'validated') {
      throw new Error('Seule une inscription validée peut être confirmée.');
    }
    if (!isValidConfirmationDate(date)) {
      throw new Error('La date de confirmation est invalide.');
    }
    if (paymentDetails && !isPaymentDetails(paymentDetails)) {
      throw new Error('Les informations du paiement sont invalides.');
    }
    if (member.membershipPaymentDate !== null) {
      throw new Error('Cette confirmation a déjà été enregistrée.');
    }
    const updated = {
      ...member,
      membershipPaymentDate: date,
      ...(paymentDetails ? { paymentDetails } : {}),
    };
    this.updateMembers(this.members().map((item) => (item.id === id ? updated : item)));
  }

  /** Removes a member and persists the updated collection. */
  remove(id: number): void {
    this.updateMembers(this.members().filter((member) => member.id !== id));
  }

  /** Updates the member signal and stores the resulting collection. */
  private updateMembers(members: Adherent[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
    this.members.set(members);
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

function isPaymentDetails(value: unknown): value is PaymentDetails {
  if (!value || typeof value !== 'object') return false;
  const details = value as Record<string, unknown>;
  if (typeof details['comment'] !== 'string' || details['comment'].length > 1000) return false;
  if (details['document'] === null) return true;
  if (!details['document'] || typeof details['document'] !== 'object') return false;
  const document = details['document'] as Record<string, unknown>;
  if (typeof document['name'] !== 'string' || !document['name']) return false;
  if (typeof document['data'] !== 'string') return false;
  const match =
    /^data:(application\/pdf|image\/jpeg|image\/png);base64,([A-Za-z0-9+/]*={0,2})$/.exec(
      document['data'],
    );
  if (!match) return false;
  const base64 = match[2];
  if (base64.length % 4 !== 0) return false;
  const size = (base64.length * 3) / 4 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  return size <= MAX_PAYMENT_DOCUMENT_SIZE;
}

/** Migrates a stored member from the legacy birth-year and roles fields. */
function migrateLegacyAdherent(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const member = value as Record<string, unknown>;
  const legacyMember = { ...member };
  if (!('medicalCertificate' in legacyMember)) legacyMember['medicalCertificate'] = null;
  if (!('medicalCertificateReceivedDate' in legacyMember))
    legacyMember['medicalCertificateReceivedDate'] = null;
  if (!('membershipPaymentDate' in legacyMember)) legacyMember['membershipPaymentDate'] = null;
  if (!('rightOfPublicity' in legacyMember)) legacyMember['rightOfPublicity'] = null;
  if ('birthYear' in legacyMember && !('birthDate' in legacyMember)) {
    legacyMember['birthDate'] = null;
    delete legacyMember['birthYear'];
  }

  const legacyStatuses: Record<string, RegistrationStatus> = {
    'pending-validation': 'validated',
    'to-validate': 'pending',
  };
  if (typeof legacyMember['registrationStatus'] === 'string') {
    legacyMember['registrationStatus'] =
      legacyStatuses[legacyMember['registrationStatus']] ?? legacyMember['registrationStatus'];
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
    (typeof member['medicalCertificate'] === 'boolean' || member['medicalCertificate'] === null) &&
    (member['medicalCertificateReceivedDate'] === null ||
      (typeof member['medicalCertificateReceivedDate'] === 'string' &&
        isValidStoredDate(member['medicalCertificateReceivedDate']))) &&
    (member['membershipPaymentDate'] === null ||
      (typeof member['membershipPaymentDate'] === 'string' &&
        isValidStoredDate(member['membershipPaymentDate']))) &&
    (member['paymentDetails'] === undefined || isPaymentDetails(member['paymentDetails'])) &&
    (typeof member['rightOfPublicity'] === 'boolean' || member['rightOfPublicity'] === null) &&
    REGISTRATION_STATUSES.includes(member['registrationStatus'] as RegistrationStatus)
  );
}
