import { Component } from '@angular/core';
import { Banner } from '../component-banner/banner';
import { RouterLink } from '@angular/router';

@Component({
  imports: [Banner, RouterLink],
  selector: 'app-component-accueil',
  styleUrl: './component-accueil.css',
  templateUrl: './component-accueil.html',
})
export class ComponentAccueil {}
