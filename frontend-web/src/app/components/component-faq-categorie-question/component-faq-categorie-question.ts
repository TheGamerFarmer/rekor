import { Component, inject, input, OnInit } from '@angular/core';
import { MockFaqService } from '../../services/mock-faq-service';
import { QuestionReponse } from '../../interfaces/question-reponse-interface';
import { ComponentFaqQuestion } from '../component-faq-question/component-faq-question';

@Component({
  imports: [ComponentFaqQuestion],
  selector: 'app-component-faq-categorie-question',
  styleUrl: './component-faq-categorie-question.css',
  templateUrl: './component-faq-categorie-question.html',
})
export class ComponentFaqCategorieQuestion implements OnInit {
  private mockFAQ = inject(MockFaqService);
  titre = input.required<string>();
  qr: QuestionReponse[] = [];
  estSelectBool = false;

  onClickListener() {
    this.estSelectBool = !this.estSelectBool;
  }

  ngOnInit() {
    this.qr = this.mockFAQ.getQuestionsReponses(this.titre());
  }
}
