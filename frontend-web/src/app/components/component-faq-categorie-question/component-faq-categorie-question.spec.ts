import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFaqCategorieQuestion } from './component-faq-categorie-question';
import { MockFaqService } from '../../services/mock-faq-service';
import { QuestionReponse } from '../../interfaces/question-reponse-interface';
import { Mocked, vi } from 'vitest';

describe('ComponentFaqCategorieQuestion', () => {
  let component: ComponentFaqCategorieQuestion;
  let fixture: ComponentFixture<ComponentFaqCategorieQuestion>;
  let mockFAQ: Mocked<MockFaqService>;

  const questions: QuestionReponse[] = [
    {
      question: 'Comment s’inscrire ?',
      reponse: 'Il faut remplir un formulaire.',
    },
    {
      question: 'Qui peut rejoindre le club ?',
      reponse: 'Tout le monde peut rejoindre le club.',
    },
  ];

  beforeEach(async () => {
    mockFAQ = {
      getAllTitles: vi.fn(),
      getQuestionsReponses: vi.fn(),
    } as unknown as Mocked<MockFaqService>;

    mockFAQ.getQuestionsReponses.mockReturnValue(questions);

    await TestBed.configureTestingModule({
      imports: [ComponentFaqCategorieQuestion],
      providers: [{ provide: MockFaqService, useValue: mockFAQ }],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFaqCategorieQuestion);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('titre', 'Inscription et adhésion');

    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait récupérer les questions du service', () => {
    expect(mockFAQ.getQuestionsReponses).toHaveBeenCalledWith('Inscription et adhésion');

    expect(component.qr.length).toBe(2);
  });

  it('devrait afficher le titre en majuscules', () => {
    const titre = fixture.nativeElement.querySelector('h2');

    expect(titre.textContent.trim()).toBe('INSCRIPTION ET ADHÉSION');
  });

  it('ne devrait pas afficher les questions initialement', () => {
    const questionsAffichees = fixture.nativeElement.querySelectorAll('app-component-faq-question');

    expect(questionsAffichees.length).toBe(0);
  });

  it('devrait afficher les questions après un clic', () => {
    const banniere = fixture.nativeElement.querySelector('.banniere-categorie');

    banniere.click();
    fixture.detectChanges();

    const questionsAffichees = fixture.nativeElement.querySelectorAll('app-component-faq-question');

    expect(questionsAffichees.length).toBe(2);
  });

  it('devrait masquer les questions après un deuxième clic', () => {
    const banniere = fixture.nativeElement.querySelector('.banniere-categorie');

    banniere.click();
    fixture.detectChanges();

    banniere.click();
    fixture.detectChanges();

    const questionsAffichees = fixture.nativeElement.querySelectorAll('app-component-faq-question');

    expect(questionsAffichees.length).toBe(0);
  });

  it('devrait modifier estSelectBool après un clic', () => {
    expect(component.estSelectBool).toBe(false);

    component.onClickListener();

    expect(component.estSelectBool).toBe(true);
  });
});
