import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { faqTitles, getQuestionsReponses } from './faq.data';
import { Banner } from '../component-banner/banner';

@Component({
  imports: [Banner, UpperCasePipe],
  selector: 'app-component-faq',
  styleUrl: './component-faq.css',
  templateUrl: './component-faq.html',
})
export class ComponentFaq {
  protected readonly categories = faqTitles.map((titre) => ({
    titre,
    questions: getQuestionsReponses(titre),
    ouverte: false,
  }));
}
