import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ComponentEvenementDetail } from './component-evenement-detail';

describe('ComponentEvenementDetail', () => {
  let fixture: ComponentFixture<ComponentEvenementDetail>;
  let params: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'gouter-du-club' }));
    await TestBed.configureTestingModule({
      imports: [ComponentEvenementDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenementDetail);
    fixture.detectChanges();
  });

  it('renders the selected event detail and a link back to the news list', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Goûter organisé par le club',
    );
    expect(fixture.nativeElement.querySelector('.event-body')?.textContent).toContain(
      'goûter convivial',
    );
    expect(fixture.nativeElement.querySelector('time')?.getAttribute('datetime')).toBe(
      '2026-09-13',
    );
    expect(fixture.nativeElement.querySelector('.banner')?.getAttribute('style')).toContain(
      '/img/gouter.jpg',
    );
    expect(fixture.nativeElement.querySelectorAll('.event-info dt img').length).toBe(4);
    expect(fixture.nativeElement.querySelector('.event-info')?.textContent).toContain(
      'Non précisée',
    );
    expect(fixture.nativeElement.querySelector('.event-info')?.textContent).toContain(
      'Non précisé',
    );
    expect(fixture.nativeElement.querySelector('main app-button a')?.getAttribute('href')).toBe(
      '/evenements',
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

  it('provides a fallback for an unknown event slug', () => {
    params.next(convertToParamMap({ slug: 'unknown' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Actualité introuvable');
    expect(fixture.nativeElement.querySelector('a[href="/evenements"]')).not.toBeNull();
  });
});
