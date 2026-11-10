import { Routes } from '@angular/router';

import { ComponentAccueil } from './components/component-accueil/component-accueil';
import { ComponentCompte } from './components/component-compte/component-compte';
import { ComponentConnexion } from './components/component-connexion/component-connexion';
import { ComponentActualite } from './components/component-actualite/component-actualite';
import { ComponentActualiteDetail } from './components/component-actualite-detail/component-actualite-detail';
import { ComponentInscription } from './components/component-inscription/component-inscription';
import { PresentationClubComponent } from './components/presentation-club-component/presentation-club-component';

export const routes: Routes = [
  { path: '', component: ComponentAccueil },
  { path: 'compte', component: ComponentCompte },
  { path: 'connexion', component: ComponentConnexion },
  { path: 'actualites', component: ComponentActualite },
  { path: 'actualites/:slug', component: ComponentActualiteDetail },
  { path: 'inscription', component: ComponentInscription },
  { path: 'presentation-club', component: PresentationClubComponent },
  { path: '**', redirectTo: '' },
];
