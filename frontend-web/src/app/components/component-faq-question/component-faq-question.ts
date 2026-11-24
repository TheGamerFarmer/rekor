import { Component, input } from '@angular/core';
import { QuestionReponse } from '../../interfaces/question-reponse-interface';
import { UpperCasePipe } from '@angular/common';

@Component({
  imports: [UpperCasePipe],
  selector: 'app-component-faq-question',
  styleUrl: './component-faq-question.css',
  templateUrl: './component-faq-question.html',
})
export class ComponentFaqQuestion {
  qr = input.required<QuestionReponse>();
}
