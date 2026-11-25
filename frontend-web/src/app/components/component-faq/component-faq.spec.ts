import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFaq } from './component-faq';

describe('ComponentFaq', () => {
  let component: ComponentFaq;
  let fixture: ComponentFixture<ComponentFaq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentFaq],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFaq);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait afficher toutes les catégories', () => {
    const categories = fixture.nativeElement.querySelectorAll('.faq-category');

    expect(categories.length).toBe(6);
  });

  it('affiche la bannière commune et une introduction à la FAQ', () => {
    const banner = fixture.nativeElement.querySelector('app-component-banner');
    expect(banner.getAttribute('title')).toBe('Questions fréquentes');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Questions fréquentes');
    expect(fixture.nativeElement.querySelector('.faq-intro').textContent).toContain(
      'Choisissez une catégorie',
    );
  });

  it('devrait afficher une catégorie par titre', () => {
    const categories = fixture.nativeElement.querySelectorAll('.faq-category');

    const titre = categories[0].querySelector('.category-label');

    expect(titre.textContent.trim()).toBe('INSCRIPTION ET ADHÉSION');
  });

  it('ouvre et referme chaque catégorie indépendamment en affichant ses questions et réponses', () => {
    const categories = fixture.nativeElement.querySelectorAll(
      '.faq-category',
    ) as NodeListOf<HTMLElement>;
    const first = categories[0].querySelector('button')!;
    const second = categories[1].querySelector('button')!;

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(categories[0].querySelectorAll('.faq-question')).toHaveLength(0);
    first.click();
    fixture.detectChanges();

    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(categories[0].querySelectorAll('.faq-question')).toHaveLength(7);
    expect(categories[0].querySelector('h3')?.textContent?.trim()).toBe(
      "COMMENT S'INSCRIRE AU CLUB ?",
    );
    expect(categories[0].querySelector('.faq-question p')?.textContent?.trim()).toContain(
      "formulaire d'inscription sur le site",
    );
    expect(categories[0].querySelector('.faq-question a')?.getAttribute('href')).toBe(
      '/inscription',
    );
    expect(second.getAttribute('aria-expanded')).toBe('false');
    second.click();
    fixture.detectChanges();

    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(categories[1].querySelectorAll('.faq-question')).toHaveLength(7);
    expect(categories[1].querySelector('.faq-question a')?.getAttribute('href')).toBe(
      '/presentation-club',
    );
    first.click();
    fixture.detectChanges();

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(categories[0].querySelectorAll('.faq-question')).toHaveLength(0);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(categories[1].querySelectorAll('.faq-question')).toHaveLength(7);
  });
});
