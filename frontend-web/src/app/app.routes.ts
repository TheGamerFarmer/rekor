import { Routes } from '@angular/router';

import { ComponentAccueil } from './components/component-accueil/component-accueil';
import { ComponentCompte } from './components/component-compte/component-compte';
import { ComponentConnexion } from './components/component-connexion/component-connexion';
import { ComponentEvenement } from './components/component-evenement/component-evenement';
import { ComponentEvenementDetail } from './components/component-evenement-detail/component-evenement-detail';
import { ComponentInscription } from './components/component-inscription/component-inscription';
import { PresentationClubComponent } from './components/presentation-club-component/presentation-club-component';

export const routes: Routes = [
  { path: '', component: ComponentAccueil },
  { path: 'compte', component: ComponentCompte },
  { path: 'connexion', component: ComponentConnexion },
  { path: 'evenements', component: ComponentEvenement },
  { path: 'evenements/:slug', component: ComponentEvenementDetail },
  { path: 'inscription', component: ComponentInscription },
  { path: 'presentation-club', component: PresentationClubComponent },
  { path: '**', redirectTo: '' },
];
