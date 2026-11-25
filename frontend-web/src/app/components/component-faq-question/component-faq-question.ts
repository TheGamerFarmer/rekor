import { Component, input } from '@angular/core';
import { QuestionReponse } from '../../interfaces/question-reponse-interface';
import { UpperCasePipe } from '@angular/common';

/**
 * Composant représentant une question et sa réponse dans la FAQ.
 *
 * Reçoit un objet QuestionReponse depuis son composant parent
 * et affiche son contenu.
 */
@Component({
  imports: [UpperCasePipe],
  selector: 'app-component-faq-question',
  styleUrl: './component-faq-question.css',
  templateUrl: './component-faq-question.html',
})
export class ComponentFaqQuestion {
  qr = input.required<QuestionReponse>();
}
