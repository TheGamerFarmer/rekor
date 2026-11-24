import { Component, inject } from '@angular/core';
import { MockFaqService } from '../../services/mock-faq-service';
import { ComponentFaqCategorieQuestion } from '../component-faq-categorie-question/component-faq-categorie-question';

/**
 * Composant principal de la FAQ.
 *
 * Récupère les différentes catégories de questions/réponses
 * depuis le service MockFaqService et affiche un composant
 * pour chaque catégorie.
 */
@Component({
  imports: [ComponentFaqCategorieQuestion],
  selector: 'app-component-faq',
  styleUrl: './component-faq.css',
  templateUrl: './component-faq.html',
})
export class ComponentFaq {
  /** Service permettant de récupérer les données de la FAQ. */
  private mockFAQ = inject(MockFaqService);

  /** Liste des titres des différentes catégories de la FAQ. */
  titres: string[] = this.mockFAQ.getAllTitles();
}
