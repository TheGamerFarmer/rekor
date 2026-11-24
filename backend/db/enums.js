/** Roles a user can hold within the application, ordered from most to least privileged. */
const USER_ROLE = {
  ADMINISTRATEUR: 'Administrateur',
  ENTRAINEUR: 'Entraineur',
  CAPITAINE: 'Capitaine',
  ADHERENT: 'Adhérent',
  VISITEUR: 'Visiteur',
};

/** Accepted pronouns for a user profile. */
const USER_PRONOUN = {
  IL: 'Il',
  ELLE: 'Elle',
  IEL: 'Iel',
  AUTRE: 'Autre',
};

/** Types of event that can be scheduled for a group. */
const EVENT_TYPE = {
  ENTRAINEMENT: 'Entrainement',
  MATCH_AMICAL: 'Match-amical',
  MATCH_COMPETITIF: 'Match-compétitif',
  REUNION: 'Réunion',
  AUTRE: 'Autre',
};

/** Categories of document that can be attached to an association. */
const DOCUMENT_TYPE = {
  FACTURE: 'Facture',
  CERTIFICAT_MEDICAL: 'Certificat_médical',
  AUTRE: 'Autre',
};

/** Media formats accepted for a publication. */
const MEDIA_TYPE = {
  VIDEO: 'Vidéo',
  IMAGE: 'Image',
};

module.exports = { USER_ROLE, USER_PRONOUN, EVENT_TYPE, DOCUMENT_TYPE, MEDIA_TYPE };
