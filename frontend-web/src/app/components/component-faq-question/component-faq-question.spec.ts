import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFaqQuestion } from './component-faq-question';
import { QuestionReponse } from '../../interfaces/question-reponse-interface';

describe('ComponentFaqQuestion', () => {
  let component: ComponentFaqQuestion;
  let fixture: ComponentFixture<ComponentFaqQuestion>;

  const question: QuestionReponse = {
    question: 'Comment s’inscrire au club ?',
    reponse: 'Il faut remplir un formulaire d’inscription.',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentFaqQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFaqQuestion);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('qr', question);

    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait afficher la question en majuscules', () => {
    const titre = fixture.nativeElement.querySelector('h3');

    expect(titre.textContent.trim()).toBe('COMMENT S’INSCRIRE AU CLUB ?');
  });

  it('devrait afficher la réponse', () => {
    const reponse = fixture.nativeElement.querySelector('p');

    expect(reponse.textContent.trim()).toBe('Il faut remplir un formulaire d’inscription.');
  });

  it('devrait afficher une question et une réponse', () => {
    const titre = fixture.nativeElement.querySelectorAll('h3');
    const reponses = fixture.nativeElement.querySelectorAll('p');

    expect(titre.length).toBe(1);
    expect(reponses.length).toBe(1);
  });
});
