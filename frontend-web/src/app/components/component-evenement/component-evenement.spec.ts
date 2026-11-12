import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentEvenement } from './component-evenement';
import { evenements, type Evenement } from './evenements.data';

describe('ComponentEvenement', () => {
  let fixture: ComponentFixture<ComponentEvenement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentEvenement],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenement);
    fixture.detectChanges();
  });

  it('renders the club news with their images and destinations', () => {
    const cards = fixture.nativeElement.querySelectorAll('.news-card');
    const links = fixture.nativeElement.querySelectorAll('.news-link a');

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Actualités et événements',
    );
    expect(cards.length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Goûter organisé');
    expect(fixture.nativeElement.textContent).toContain('Les inscriptions');
    expect(fixture.nativeElement.textContent).toContain('Le club part');
    expect(Array.from(links, (link: Element) => link.getAttribute('href'))).toEqual([
      '/evenements/gouter-du-club',
      '/evenements/inscriptions-ouvertes',
      '/evenements/vacances-dete',
    ]);
    expect(cards[0].getAttribute('style')).toContain('/img/gouter.jpg');
    expect(fixture.nativeElement.querySelector('.pagination')?.textContent).toContain('1');
    expect(
      (fixture.nativeElement.querySelector('.pagination-previous button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('.pagination-next button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('shows at most five events and navigates between pages', () => {
    const additionalEvents: Evenement[] = Array.from({ length: 9 }, (_, index) => ({
      ...evenements[0],
      slug: `actualite-${index + 1}`,
      title: `Actualité ${index + 1}`,
    }));
    fixture.componentRef.setInput('events', [...evenements, ...additionalEvents]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(5);

    const pageTwo = fixture.nativeElement.querySelector(
      '.pagination-page:nth-child(2) button',
    ) as HTMLButtonElement;
    pageTwo.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(5);
    expect(fixture.nativeElement.querySelector('.news-card h2')?.textContent).toContain(
      'Actualité 3',
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

    const lastPage = fixture.nativeElement.querySelector(
      '.pagination-pages app-button:last-child button',
    ) as HTMLButtonElement;
    lastPage.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(2);
  });
});
