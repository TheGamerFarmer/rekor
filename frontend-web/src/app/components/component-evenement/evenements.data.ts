export type EvenementType =
  'Entraînement' | 'Match amical' | 'Match compétitif' | 'Réunion' | 'Autre';

export type ParticipantStatus = 'present' | 'absent' | 'pending';

export interface Participant {
  id: number;
  name: string;
  status: ParticipantStatus;
}

export interface Evenement {
  id: number;
  slug: string;
  name: string;
  type: EvenementType;
  date: string;
  time: string;
  place: string;
  description: string;
  group: string;
  participants?: Participant[];
}

/** Extracts the venue name from the first segment of a complete address. */
export function getNomGymnase(adresse: string): string {
  return adresse.split(',')[0].trim();
}

export const defaultEvenements: readonly Evenement[] = [
  {
    id: 1,
    slug: 'match-amical-gieres-lyon',
    name: 'Match amical - Gières vs Lyon',
    type: 'Match amical',
    date: '2026-10-10',
    time: '18:00',
    place: 'Gymnase de la Plaine des sports, 1 Rue des Sports, 38610 Gières',
    description: "L'équipe A reçoit Lyon pour un match amical.",
    group: 'Equipe A',
  },
  {
    id: 2,
    slug: 'tournoi-jeunes',
    name: 'Tournoi jeunes',
    type: 'Match compétitif',
    date: '2026-10-18',
    time: '09:00',
    place: 'Gymnase de la Plaine des sports, 1 Rue des Sports, 38610 Gières',
    description: 'Une matinée de compétition et de partage pour les équipes jeunes du club.',
    group: 'Jeunes',
  },
  {
    id: 3,
    slug: 'entrainement-2026-10-20',
    name: 'Entraînement',
    type: 'Entraînement',
    date: '2026-10-20',
    time: '20:00',
    place: 'Gymnase de la Plaine des sports, 1 Rue des Sports, 38610 Gières',
    description: 'Séance collective hebdomadaire.',
    group: 'Tous',
  },
  {
    id: 4,
    slug: 'entrainement-2026-11-17',
    name: 'Entraînement',
    type: 'Entraînement',
    date: '2026-11-17',
    time: '20:00',
    place: 'Gymnase de la Plaine des sports, 1 Rue des Sports, 38610 Gières',
    description: 'Séance collective hebdomadaire.',
    group: 'Tous',
  },
  {
    id: 5,
    slug: 'entrainement-jeunes-2026-11-21',
    name: 'Entraînement jeunes',
    type: 'Entraînement',
    date: '2026-11-21',
    time: '10:00',
    place: 'Gymnase de la Plaine des sports, 1 Rue des Sports, 38610 Gières',
    description: 'Une séance ludique pour progresser ensemble et préparer les tournois.',
    group: 'Jeunes',
  },
  {
    id: 6,
    slug: 'match-gieres-grenoble',
    name: 'Match - Gières vs Grenoble',
    type: 'Match compétitif',
    date: '2026-11-28',
    time: '20:00',
    place: 'Gymnase de Grenoble, 12 Avenue des Alpes, 38000 Grenoble',
    description: "L'équipe B rencontre Grenoble pour un match.",
    group: 'Equipe B',
  },
  {
    id: 7,
    slug: 'gouter-du-club',
    name: 'Goûter du club',
    type: 'Autre',
    date: '2026-12-05',
    time: '17:00',
    place: 'Salle polyvalente de Gières, 2 Place de la Mairie, 38610 Gières',
    description: 'Un moment convivial pour les licenciés, les familles et les bénévoles du club.',
    group: 'Tous',
  },
];
