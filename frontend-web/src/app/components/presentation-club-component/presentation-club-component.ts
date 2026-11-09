import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxTimelineModule, NgxTimelineOrientation } from '@frxjs/ngx-timeline';

@Component({
  imports: [MatIcon, NgxTimelineModule],
  selector: 'app-presentation-club-component',
  styleUrl: './presentation-club-component.css',
  templateUrl: './presentation-club-component.html',
})
export class PresentationClubComponent {
  frise: { description: string; timestamp: Date; title: string }[] = [
    {
      title: '1969',
      timestamp: new Date(1969, 4, 1),
      description: 'Création du club',
    },
    {
      title: '1984',
      timestamp: new Date(1984, 10, 23),
      description: "Création de l'équipe féminine",
    },
    {
      title: '2005',
      timestamp: new Date(2005, 4, 1),
      description: 'Victoire au tournoi national',
    },
    {
      title: '2015',
      timestamp: new Date(2015, 7, 14, 12, 12, 12, 120),
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
