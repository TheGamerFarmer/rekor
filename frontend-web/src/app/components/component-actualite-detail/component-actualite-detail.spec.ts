import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ComponentActualiteDetail } from './component-actualite-detail';
import { ActualiteService } from '../../services/actualite.service';

describe('ComponentActualiteDetail', () => {
  let fixture: ComponentFixture<ComponentActualiteDetail>;
  let params: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    localStorage.removeItem('rekor-actualites');
    params = new BehaviorSubject(convertToParamMap({ id: '2' }));
    await TestBed.configureTestingModule({
      imports: [ComponentActualiteDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentActualiteDetail);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('rekor-actualites');
  });

  it('renders the selected actualite detail and a link back to the news list', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Collecte solidaire organisée par le club',
    );
    expect(fixture.nativeElement.querySelector('.actualite-body strong')?.textContent).toBe(
      'collecte solidaire',
    );
    expect(fixture.nativeElement.querySelector('.banner')?.getAttribute('style')).toContain(
      '/images/collecte.png',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Informations pratiques');
    expect(fixture.nativeElement.querySelector('main app-button a')?.getAttribute('href')).toBe(
      '/actualites',
    );
  });

  it('shows a registration action for the registration news', () => {
    params.next(convertToParamMap({ id: '3' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Les inscriptions sont ouvertes !',
    );
    expect(fixture.nativeElement.querySelector('a[href="/inscription"]')).not.toBeNull();
  });

  it('displays a newly created news item from the shared service', () => {
    TestBed.inject(ActualiteService).add({
      titre: 'Une nouvelle actualité',
      summary: 'Résumé',
      image: '/images/volley2.jpg',
      date: '2026-12-01',
      association: 'Gières Volley-Ball',
      corps: 'Premier paragraphe\nDeuxième paragraphe',
    });
    params.next(convertToParamMap({ id: '5' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Une nouvelle actualité',
    );
    expect(fixture.nativeElement.querySelector('.actualite-body')?.textContent).toContain(
      'Deuxième paragraphe',
    );
  });

  it('provides a fallback for an unknown actualite ID', () => {
    params.next(convertToParamMap({ id: '999' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Actualité introuvable');
    expect(fixture.nativeElement.querySelector('a[href="/actualites"]')).not.toBeNull();
  });

  it('provides a fallback for a non-numeric actualite ID', () => {
    params.next(convertToParamMap({ id: 'invalid' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Actualité introuvable');
  });
});
