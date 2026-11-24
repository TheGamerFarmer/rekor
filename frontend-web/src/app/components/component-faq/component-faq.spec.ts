import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFaq } from './component-faq';
import { MockFaqService } from '../../services/mock-faq-service';
import { Mocked, vi } from 'vitest';

describe('ComponentFaq', () => {
  let component: ComponentFaq;
  let fixture: ComponentFixture<ComponentFaq>;
  let mockFAQ: Mocked<MockFaqService>;

  beforeEach(async () => {
    mockFAQ = {
      getAllTitles: vi.fn(),
      getQuestionsReponses: vi.fn(),
    } as unknown as Mocked<MockFaqService>;

    mockFAQ.getAllTitles.mockReturnValue([
      'Inscription et adhésion',
      'Tarifs et paiement',
      'Entraînements et matchs',
    ]);

    await TestBed.configureTestingModule({
      imports: [ComponentFaq],
      providers: [{ provide: MockFaqService, useValue: mockFAQ }],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFaq);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait récupérer les titres depuis le service', () => {
    expect(mockFAQ.getAllTitles).toHaveBeenCalled();
    expect(component.titres.length).toBe(3);
  });

  it('devrait afficher toutes les catégories', () => {
    const categories = fixture.nativeElement.querySelectorAll(
      'app-component-faq-categorie-question',
    );

    expect(categories.length).toBe(3);
  });

  it('devrait afficher une catégorie par titre', () => {
    const categories = fixture.nativeElement.querySelectorAll(
      'app-component-faq-categorie-question',
    );

    const titre = categories[0].querySelector('.titre-categorie');

    expect(titre.textContent.trim()).toBe('INSCRIPTION ET ADHÉSION');
  });
});
