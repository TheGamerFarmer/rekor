import { Routes } from '@angular/router';

import { ComponentAccueil } from './component-accueil/component-accueil';
import { ComponentCompte } from './component-compte/component-compte';
import { ComponentConnexion } from './component-connexion/component-connexion';
import { ComponentEvenement } from './component-evenement/component-evenement';
import { ComponentEvenementDetail } from './component-evenement-detail/component-evenement-detail';
import { ComponentInscription } from './component-inscription/component-inscription';

export const routes: Routes = [
  { path: '', component: ComponentAccueil },
  { path: 'compte', component: ComponentCompte },
  { path: 'connexion', component: ComponentConnexion },
  { path: 'evenements', component: ComponentEvenement },
  { path: 'evenements/:slug', component: ComponentEvenementDetail },
  { path: 'inscription', component: ComponentInscription },
  { path: '**', redirectTo: '' },
];
