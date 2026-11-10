/** Roles a user can hold within the application, ordered from most to least privileged. */
const USER_ROLES = ['Entraineur', 'Capitaine', 'Adhérent', 'Visiteur'];

/** Accepted pronouns for a user profile. */
const USER_PRONOUNS = ['Il', 'Elle', 'Iel', 'Autre'];

/** Types of event that can be scheduled for a group. */
const EVENT_TYPES = ['Entrainement', 'Match-amical', 'Match-compétitif', 'Réunion', 'Autre'];

/** Categories of document that can be attached to an association. */
const DOCUMENT_TYPES = ['Facture', 'Certificat_médical', 'Autre'];

/** Media formats accepted for a publication. */
const MEDIA_TYPES = ['Vidéo', 'Image'];

module.exports = { USER_ROLES, USER_PRONOUNS, EVENT_TYPES, DOCUMENT_TYPES, MEDIA_TYPES };
