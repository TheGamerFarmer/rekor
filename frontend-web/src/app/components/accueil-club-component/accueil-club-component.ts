import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxTimelineModule, NgxTimelineOrientation } from '@frxjs/ngx-timeline';

@Component({
  imports: [MatIcon, NgxTimelineModule],
  selector: 'app-accueil-club-component',
  styleUrl: './accueil-club-component.css',
  templateUrl: './accueil-club-component.html',
})
export class AccueilClubComponent {
  frise: { description: string; timestamp: Date; title: string }[] = [
    {
      title: '1969',
      timestamp: new Date(1969),
      description: 'Création du club',
    },
    {
      title: '1984',
      timestamp: new Date(1984),
      description: "Création de l'équipe féminine",
    },
    {
      title: '2005',
      timestamp: new Date(2005),
      description: 'Victoire au tournoi national',
    },
    {
      title: '2015',
      timestamp: new Date(2015),
      description: 'Victoire au tournoi régional',
    },
    {
      title: "Aujourd'hui",
      timestamp: new Date(),
      description: '',
    },
  ];
  protected readonly NgxTimelineOrientation = NgxTimelineOrientation;
}
