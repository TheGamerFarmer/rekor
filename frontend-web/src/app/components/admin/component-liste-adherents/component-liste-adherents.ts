import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [MatIcon],
  selector: 'app-component-liste-adherents',
  styleUrl: './component-liste-adherents.css',
  templateUrl: './component-liste-adherents.html',
  standalone: true,
})
export class ComponentListeAdherents {
  listeAdherents = [
    { id: 0, nom: 'Magnolla', prenom: 'Iris', licences: 'Validée', role: "Chef d'équipe" },
    { id: 1, nom: 'Chapuis', prenom: 'Camille', licences: 'Validée', role: 'Adhérent' },
    { id: 2, nom: 'Loury', prenom: 'Lucie', licences: 'Validée', role: 'Adhérent' },
    { id: 3, nom: 'Verron', prenom: 'Thibault', licences: 'Validée', role: 'Adhérent' },
    { id: 4, nom: 'Morel', prenom: 'Guillaume', licences: 'Validée', role: 'Administrateur' },
    { id: 5, nom: 'Yaka', prenom: 'Anna', licences: 'En cours', role: 'Visiteur' },
    { id: 6, nom: 'Giogi', prenom: 'Yvan', licences: 'Validée', role: 'Adhérent' },
  ];
}
