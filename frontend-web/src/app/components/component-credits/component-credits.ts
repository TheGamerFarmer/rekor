import { Component } from '@angular/core';
import { Banner } from '../component-banner/banner';

@Component({
  imports: [Banner],
  selector: 'app-component-credits',
  styleUrl: './component-credits.css',
  templateUrl: './component-credits.html',
})
export class ComponentCredits {
  protected readonly imageSources = [
    {
      name: 'Pexels',
      description: 'Photos libres de droits',
      url: 'https://www.pexels.com/',
      domain: 'pexels.com',
      icon: '/icons/pexels.png',
    },
    {
      name: 'Pixabay',
      description: 'Photos et vidéos libres de droits',
      url: 'https://pixabay.com/',
      domain: 'pixabay.com',
      icon: '/icons/Pixabay.png',
    },
    {
      name: 'Flaticon',
      description: 'Icônes gratuites',
      url: 'https://www.flaticon.com/',
      domain: 'flaticon.com',
      icon: '/icons/Flaticon.png',
    },
    {
      name: 'Magnific',
      description: 'Illustrations et visuels libres de droits',
      url: 'https://www.magnific.com/fr',
      domain: 'magnific.com',
      icon: '/icons/Magnific.png',
    },
  ];

  protected readonly fontSources = [
    {
      name: 'DM Sans',
      description: 'Police principale du site',
      url: 'https://fonts.google.com/specimen/DM+Sans',
      domain: 'fonts.google.com',
      previewClass: 'font-preview-sans',
      preview: 'Aa',
    },
    {
      name: 'Barlow Condensed',
      description: 'Titres et éléments en capitales',
      url: 'https://fonts.google.com/specimen/Barlow+Condensed',
      domain: 'fonts.google.com',
      previewClass: 'font-preview-condensed',
      preview: 'Aa',
    },
    {
      name: 'Roboto',
      description: 'Composants de l’interface Material',
      url: 'https://fonts.google.com/specimen/Roboto',
      domain: 'fonts.google.com',
      previewClass: 'font-preview-roboto',
      preview: 'Aa',
    },
  ];
}
