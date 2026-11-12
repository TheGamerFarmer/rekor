import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ComponentActualiteDetail } from './component-actualite-detail';

describe('ComponentActualiteDetail', () => {
  let fixture: ComponentFixture<ComponentActualiteDetail>;
  let params: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'collecte-solidaire-du-club' }));
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

  it('renders the selected actualite detail and a link back to the news list', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Collecte solidaire organisée par le club',
    );
    expect(fixture.nativeElement.querySelector('.actualite-body')?.textContent).toContain(
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
    params.next(convertToParamMap({ slug: 'inscriptions-ouvertes' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Les inscriptions sont ouvertes !',
    );
    expect(fixture.nativeElement.querySelector('a[href="/inscription"]')).not.toBeNull();
  });

  it('provides a fallback for an unknown actualite slug', () => {
    params.next(convertToParamMap({ slug: 'unknown' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Actualité introuvable');
    expect(fixture.nativeElement.querySelector('a[href="/actualites"]')).not.toBeNull();
  });
});
