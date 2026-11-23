import { Component, inject } from '@angular/core';
import { MockFaqService } from '../../services/mock-faq-service';
import { ComponentFaqCategorieQuestion } from '../component-faq-categorie-question/component-faq-categorie-question';

@Component({
  imports: [ComponentFaqCategorieQuestion],
  selector: 'app-component-faq',
  styleUrl: './component-faq.css',
  templateUrl: './component-faq.html',
})
export class ComponentFaq {
  private mockFAQ = inject(MockFaqService);
  titres: string[] = this.mockFAQ.getAllTitles();
}
