import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentActualite } from './component-actualite';
import { actualites, type Actualite } from './actualites.data';

describe('ComponentActualite', () => {
  let fixture: ComponentFixture<ComponentActualite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentActualite],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentActualite);
    fixture.detectChanges();
  });

  it('renders the club news with their images and destinations', () => {
    const cards = fixture.nativeElement.querySelectorAll('.news-card');
    const links = fixture.nativeElement.querySelectorAll('.news-link a');

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Actualités');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Nouvelle règle de jeu');
    expect(fixture.nativeElement.textContent).toContain('Collecte solidaire');
    expect(Array.from(links, (link: Element) => link.getAttribute('href'))).toEqual([
      '/actualites/nouvelle-regle-de-jeu',
      '/actualites/collecte-solidaire-du-club',
    ]);
    expect(cards[0].getAttribute('style')).toContain('/images/volley7.jpg');
    expect(fixture.nativeElement.querySelector('.pagination')?.textContent).toContain('1');
    expect(
      (fixture.nativeElement.querySelector('.pagination-previous button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('.pagination-next button') as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it('shows at most two actualités and navigates between pages', () => {
    const additionalActualites: Actualite[] = Array.from({ length: 9 }, (_, index) => ({
      ...actualites[0],
      slug: `actualite-${index + 1}`,
      title: `Actualité ${index + 1}`,
    }));
    fixture.componentRef.setInput('actualites', [...actualites, ...additionalActualites]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(2);

    const pageTwo = fixture.nativeElement.querySelector(
      '.pagination-page:nth-child(2) button',
    ) as HTMLButtonElement;
    pageTwo.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.news-card h2')?.textContent).toContain(
      'Les inscriptions',
    );
    expect(
      fixture.nativeElement
        .querySelector('.pagination-page button[aria-current="page"]')
        ?.textContent.trim(),
    ).toBe('2');

    const previousPage = fixture.nativeElement.querySelector(
      '.pagination-previous button',
    ) as HTMLButtonElement;
    previousPage.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('.pagination-page button[aria-current="page"]')
        ?.textContent.trim(),
    ).toBe('1');

    const nextPage = fixture.nativeElement.querySelector(
      '.pagination-next button',
    ) as HTMLButtonElement;
    nextPage.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('.pagination-page button[aria-current="page"]')
        ?.textContent.trim(),
    ).toBe('2');

    let nextPageButton = fixture.nativeElement.querySelector(
      '.pagination-next button',
    ) as HTMLButtonElement;
    while (!nextPageButton.disabled) {
      nextPageButton.click();
      fixture.detectChanges();
      nextPageButton = fixture.nativeElement.querySelector(
        '.pagination-next button',
      ) as HTMLButtonElement;
    }

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(1);
  });
});
