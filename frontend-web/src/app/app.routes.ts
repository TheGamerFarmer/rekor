import { Routes } from '@angular/router';

import { ComponentAccueil } from './component-accueil/component-accueil';
import { ComponentCompte } from './component-compte/component-compte';
import { ComponentConnexion } from './component-connexion/component-connexion';
import { ComponentInscription } from './component-inscription/component-inscription';

export const routes: Routes = [
  { path: '', component: ComponentAccueil },
  { path: 'compte', component: ComponentCompte },
  { path: 'connexion', component: ComponentConnexion },
  { path: 'inscription', component: ComponentInscription },
  { path: '**', redirectTo: '' },
];
