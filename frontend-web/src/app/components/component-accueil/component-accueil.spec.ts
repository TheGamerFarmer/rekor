import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ComponentAccueil } from './component-accueil';

describe('ComponentAccueil', () => {
  let fixture: ComponentFixture<ComponentAccueil>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentAccueil],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentAccueil);
    fixture.detectChanges();
    page = fixture.nativeElement as HTMLElement;
  });

  it('renders the home banner with the next match', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(page.querySelector('.banner')?.id).toBe('accueil');
    expect(page.querySelector('app-component-banner h1')?.textContent).toContain('Gières vs Lyon');
    expect(page.querySelector('app-component-banner h1')?.textContent).toContain('10 octobre');
    expect(page.querySelector('app-component-banner .match-strip')).not.toBeNull();
  });

  it('renders links to the club sections', () => {
    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('.feature-card'));

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/inscription',
      '/evenements',
      '/regles',
      '/actualites',
      '/presentation-club',
    ]);
    expect(links.map((link) => link.querySelector('h3')?.textContent?.trim())).toEqual([
      'Inscription',
      'Événements',
      'Règles du jeu',
      'Actualités',
      'Le club',
    ]);
  });

  it('renders upcoming events and the link to all events', () => {
    const appointments = page.querySelector('#rendez-vous');
    const events = appointments?.querySelectorAll('.evenement-card');

    expect(appointments?.querySelector('a')?.getAttribute('href')).toBe('/evenements');
    expect(events?.length).toBe(2);
    expect(events?.[0].textContent).toContain('Match amical - Gières vs Lyon');
    expect(events?.[0].textContent).toContain('10 octobre');
    expect(events?.[1].textContent).toContain('Tournoi jeunes');
    expect(events?.[1].textContent).toContain('18 octobre');
  });
});
