import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentActualite } from './component-actualite';
import { actualites, type Actualite } from './actualites.data';
import { signal } from '@angular/core';
import { UserDetails } from '../../api/model/userDetails';
import { AuthService } from '../../services/auth.service';
import { ActualiteService } from '../../services/actualite.service';

describe('ComponentActualite', () => {
  let fixture: ComponentFixture<ComponentActualite>;
  const isAuthenticated = signal(false);
  const role = signal<UserDetails.RoleEnum | null>(null);

  beforeEach(async () => {
    localStorage.removeItem('rekor-actualites');
    isAuthenticated.set(false);
    role.set(null);
    await TestBed.configureTestingModule({
      imports: [ComponentActualite],
      providers: [{ provide: AuthService, useValue: { isAuthenticated, role } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentActualite);
    fixture.detectChanges();
  });

  it('shows the creation link only to authenticated administrators', () => {
    const creationLink = () =>
      fixture.nativeElement.querySelector('a[href="/admin/actualites/nouveau"]');
    expect(creationLink()).toBeNull();
    isAuthenticated.set(true);
    for (const otherRole of [
      UserDetails.RoleEnum.Entraineur,
      UserDetails.RoleEnum.Capitaine,
      UserDetails.RoleEnum.Adhrent,
    ]) {
      role.set(otherRole);
      fixture.detectChanges();
      expect(creationLink()).toBeNull();
    }
    role.set(UserDetails.RoleEnum.Administrateur);
    fixture.detectChanges();
    expect(creationLink()).not.toBeNull();
    isAuthenticated.set(false);
    fixture.detectChanges();
    expect(creationLink()).toBeNull();
  });

  it('displays newly added news at the beginning of the list', () => {
    TestBed.inject(ActualiteService).add({
      titre: 'Une nouvelle actualité',
      summary: 'Résumé',
      image: '/images/volley2.jpg',
      date: '2026-12-01',
      association: 'Gières Volley-Ball',
      corps: 'Contenu',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.news-card h2')?.textContent).toContain(
      'Une nouvelle actualité',
    );
    expect(fixture.nativeElement.querySelector('.news-link a')?.getAttribute('href')).toBe(
      '/actualites/5',
    );
    localStorage.removeItem('rekor-actualites');
  });

  it('renders the club news with their images and destinations', () => {
    const cards = fixture.nativeElement.querySelectorAll('.news-card');
    const links = fixture.nativeElement.querySelectorAll('.news-link a');

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Actualités');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Nouvelle règle de jeu');
    expect(fixture.nativeElement.textContent).toContain('Collecte solidaire');
    expect(Array.from(links, (link: Element) => link.getAttribute('href'))).toEqual([
      '/actualites/1',
      '/actualites/2',
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
      id: index + 10,
      titre: `Actualité ${index + 1}`,
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
