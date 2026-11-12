import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ComponentEvenementDetails } from './component-evenement-details';
import { EvenementService } from '../../services/evenement.service';
import { defaultEvenements } from '../component-evenement/evenements.data';

describe('ComponentEvenementDetails', () => {
  let fixture: ComponentFixture<ComponentEvenementDetails>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'match-gieres-grenoble' }));
    await TestBed.configureTestingModule({
      imports: [ComponentEvenementDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params.asObservable() },
        },
        {
          provide: EvenementService,
          useValue: {
            findBySlug: (slug: string) => defaultEvenements.find((event) => event.slug === slug),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenementDetails);
    fixture.detectChanges();
  });

  it('renders the event details with the formatted date and metadata', () => {
    expect(fixture.nativeElement.textContent).toContain('Match - Gières vs Grenoble');
    expect(fixture.nativeElement.textContent).toContain('28/11/2026');
    expect(fixture.nativeElement.textContent).toContain('Gymnase de Grenoble');
    expect(fixture.nativeElement.querySelector('.back-button a')?.getAttribute('href')).toBe(
      '/evenements',
    );
  });

  it('shows a fallback for an unknown event slug', () => {
    params.next(convertToParamMap({ slug: 'unknown' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Événement introuvable');
  });
});
