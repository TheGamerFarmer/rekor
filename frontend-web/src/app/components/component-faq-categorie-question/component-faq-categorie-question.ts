import { Component, inject, input, OnInit } from '@angular/core';
import { MockFaqService } from '../../services/mock-faq-service';
import { QuestionReponse } from '../../interfaces/question-reponse-interface';
import { ComponentFaqQuestion } from '../component-faq-question/component-faq-question';
import { UpperCasePipe } from '@angular/common';

/**
 * Composant représentant une catégorie de questions de la FAQ.
 *
 * Affiche le titre d'une catégorie et permet de déplier
 * ou de masquer les questions/réponses qui lui sont associées.
 */
@Component({
  imports: [ComponentFaqQuestion, UpperCasePipe],
  selector: 'app-component-faq-categorie-question',
  styleUrl: './component-faq-categorie-question.css',
  templateUrl: './component-faq-categorie-question.html',
})
export class ComponentFaqCategorieQuestion implements OnInit {
  private mockFAQ = inject(MockFaqService);
  titre = input.required<string>();
  qr: QuestionReponse[] = [];
  estSelectBool = false;

  /**
   * Permet d'afficher ou de masquer les questions/réponses
   * associées en cliquant sur l'en-tête de la catégorie.
   */
  onClickListener() {
    this.estSelectBool = !this.estSelectBool;
  }

  /**
   * Récupère les questions/réponses correspondant au titre
   * de la catégorie transmis par le composant parent.
   */
  ngOnInit() {
    this.qr = this.mockFAQ.getQuestionsReponses(this.titre());
  }
}
