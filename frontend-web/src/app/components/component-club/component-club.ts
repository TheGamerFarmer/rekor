import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxTimelineModule, NgxTimelineOrientation } from '@frxjs/ngx-timeline';
import { Banner } from '../component-banner/banner';

@Component({
  imports: [Banner, MatIcon, NgxTimelineModule],
  selector: 'app-component-club',
  styleUrl: './component-club.css',
  templateUrl: './component-club.html',
})
export class ComponentClub {
  frise: { description: string; timestamp: Date }[] = [
    {
      timestamp: new Date(1969, 4, 1),
      description: 'Création du club',
    },
    {
      timestamp: new Date(1984, 10, 23),
      description: "Création de l'équipe féminine",
    },
    {
      timestamp: new Date(2005, 4, 1),
      description: 'Victoire au tournoi national',
    },
    {
      timestamp: new Date(2015, 7, 14, 12, 12, 12, 120),
      description: 'Victoire au tournoi régional',
    },
    {
      timestamp: new Date(),
      description: "Aujourd'hui",
    },
  ];
  protected readonly NgxTimelineOrientation = NgxTimelineOrientation;
}
