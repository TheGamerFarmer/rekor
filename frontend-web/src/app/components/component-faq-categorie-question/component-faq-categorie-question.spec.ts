import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentCategorieQuestionFaq } from './component-categorie-question-faq';

describe('ComponentCategorieQuestionFaq', () => {
  let component: ComponentCategorieQuestionFaq;
  let fixture: ComponentFixture<ComponentCategorieQuestionFaq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCategorieQuestionFaq],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCategorieQuestionFaq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
