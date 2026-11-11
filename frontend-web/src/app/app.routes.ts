import { Routes } from '@angular/router';

import { ComponentAccueil } from './components/component-accueil/component-accueil';
import { ComponentCompte } from './components/component-compte/component-compte';
import { ComponentConnexion } from './components/component-connexion/component-connexion';
import { ComponentActualite } from './components/component-actualite/component-actualite';
import { ComponentActualiteDetail } from './components/component-actualite-detail/component-actualite-detail';
import { ComponentInscription } from './components/component-inscription/component-inscription';
import { ComponentClub } from './components/component-club/component-club';
import { ComponentEvenement } from './components/component-evenement/component-evenement';
import { ComponentEvenementDetails } from './components/component-evenement-details/component-evenement-details';
import { ComponentEvenementAdmin } from './components/component-evenement-admin/component-evenement-admin';
import { ComponentEvenementsAdmin } from './components/component-evenements-admin/component-evenements-admin';

export const routes: Routes = [
  { path: '', component: ComponentAccueil },
  { path: 'compte', component: ComponentCompte },
  { path: 'connexion', component: ComponentConnexion },
  { path: 'actualites', component: ComponentActualite },
  { path: 'actualites/:slug', component: ComponentActualiteDetail },
  { path: 'inscription', component: ComponentInscription },
  { path: 'presentation-club', component: ComponentClub },
  { path: 'evenements', component: ComponentEvenement },
  { path: 'evenements/:slug', component: ComponentEvenementDetails },
  { path: 'admin/evenements', component: ComponentEvenementsAdmin },
  { path: 'admin/evenements/nouveau', component: ComponentEvenementAdmin },
  { path: 'admin/evenements/:slug/modifier', component: ComponentEvenementAdmin },
  { path: '**', redirectTo: '' },
];
