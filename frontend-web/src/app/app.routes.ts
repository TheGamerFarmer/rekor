import { Routes } from '@angular/router';

import { ComponentAccueil } from './component-accueil/component-accueil';
import { ComponentConnexion } from './component-connexion/component-connexion';
import { ComponentInscription } from './component-inscription/component-inscription';

export const routes: Routes = [
  { path: '', component: ComponentAccueil },
  { path: 'connexion', component: ComponentConnexion },
  { path: 'inscription', component: ComponentInscription },
  { path: '**', redirectTo: '' },
];
