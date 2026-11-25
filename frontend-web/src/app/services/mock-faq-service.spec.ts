import { TestBed } from '@angular/core/testing';
import { MockFaqService } from './mock-faq-service';

describe('MockFaqService', () => {
  let service: MockFaqService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockFaqService],
    });

    service = TestBed.inject(MockFaqService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTitles()', () => {
    it('devrait retourner les 6 catégories', () => {
      const titres = service.getAllTitles();

      expect(titres.length).toBe(6);
    });

    it('devrait retourner les titres attendus', () => {
      const titres = service.getAllTitles();

      expect(titres).toEqual([
        'Inscription et adhésion',
        'Tarifs et paiement',
        'Entraînements et matchs',
        'Niveau, âge et matériel',
        'Santé, sécurité et mineurs',
        'Vie du club et contact',
      ]);
    });

    it('devrait retourner un tableau de chaînes de caractères', () => {
      const titres = service.getAllTitles();

      expect(Array.isArray(titres)).toBe(true);

      titres.forEach((titre) => {
        expect(typeof titre).toBe('string');
      });
    });
  });

  describe('getQuestionsReponses()', () => {
    const categories = [
      'Inscription et adhésion',
      'Tarifs et paiement',
      'Entraînements et matchs',
      'Niveau, âge et matériel',
      'Santé, sécurité et mineurs',
      'Vie du club et contact',
    ];

    it('devrait retourner des questions pour chaque catégorie', () => {
      categories.forEach((categorie) => {
        const qr = service.getQuestionsReponses(categorie);

        expect(qr.length).toBeGreaterThan(0);
      });
    });

    it('devrait retourner des objets contenant une question et une réponse', () => {
      categories.forEach((categorie) => {
        const qr = service.getQuestionsReponses(categorie);

        qr.forEach((element) => {
          expect(element.question).toBeDefined();
          expect(element.reponse).toBeDefined();

          expect(typeof element.question).toBe('string');
          expect(typeof element.reponse).toBe('string');
        });
      });
    });

    it('devrait retourner 7 questions pour les catégories qui en contiennent 7', () => {
      const categoriesAvecSeptQuestions = categories.slice(0, 5);

      categoriesAvecSeptQuestions.forEach((categorie) => {
        const qr = service.getQuestionsReponses(categorie);

        expect(qr.length).toBe(7);
      });
    });

    it('devrait retourner 5 questions pour Vie du club et contact', () => {
      const qr = service.getQuestionsReponses('Vie du club et contact');

      expect(qr.length).toBe(5);
    });

    it('devrait retourner les bonnes questions pour Inscription et adhésion', () => {
      const qr = service.getQuestionsReponses('Inscription et adhésion');

      expect(qr[0].question).toBe("Comment s'inscrire au club ?");
      expect(qr[1].question).toBe('Qui peut rejoindre le club ?');
    });

    it('devrait retourner un tableau vide pour une catégorie inexistante', () => {
      const qr = service.getQuestionsReponses('Catégorie inexistante');

      expect(qr).toEqual([]);
    });

    it('devrait retourner un tableau vide pour une chaîne vide', () => {
      const qr = service.getQuestionsReponses('');

      expect(qr).toEqual([]);
    });

    it('devrait retourner un tableau', () => {
      categories.forEach((categorie) => {
        const qr = service.getQuestionsReponses(categorie);

        expect(Array.isArray(qr)).toBe(true);
      });
    });
  });
});
