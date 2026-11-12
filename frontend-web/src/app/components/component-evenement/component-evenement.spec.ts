import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ComponentEvenement } from './component-evenement';
import { defaultEvenements } from './evenements.data';
import { EvenementService } from '../../services/evenement.service';

describe('ComponentEvenement', () => {
  let fixture: ComponentFixture<ComponentEvenement>;
  let events = signal(defaultEvenements);

  beforeEach(async () => {
    events = signal(defaultEvenements);
    await TestBed.configureTestingModule({
      imports: [ComponentEvenement],
      providers: [
        {
          provide: EvenementService,
          useValue: { evenements: events },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenement);
    fixture.detectChanges();
  });

  it('renders upcoming events by default', () => {
    expect(fixture.nativeElement.textContent).toContain('Entraînement');
    expect(fixture.nativeElement.querySelector('.event-list')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/admin/evenements"]')).not.toBeNull();
  });

  it('switches between upcoming and past events', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.event-filters button');

    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Match amical - Gières vs Lyon');
    expect(fixture.nativeElement.textContent).not.toContain('Match - Gières vs Grenoble');

    buttons[0].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Match - Gières vs Grenoble');
  });

  it('links each event to its detail page', () => {
    const link = fixture.nativeElement.querySelector(
      'a[href="/evenements/entrainement-2026-11-17"]',
    );

    expect(link).not.toBeNull();
  });

  it('shows pagination and clamps navigation to the available pages', () => {
    events.set([
      ...defaultEvenements,
      ...defaultEvenements.map((event, index) => ({
        ...event,
        id: event.id + 10 + index,
        slug: `${event.slug}-copy`,
        date: '2026-12-01',
      })),
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pagination')).not.toBeNull();
    const next = fixture.nativeElement.querySelector('.pagination app-button:last-child button');
    next.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Page 2 sur 2');
    const previous = fixture.nativeElement.querySelector(
      '.pagination app-button:first-child button',
    );
    previous.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Page 1 sur 2');
  });

  it('shows an empty state when no events match the filter', () => {
    events.set([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')?.textContent).toContain(
      'Aucun événement',
    );
  });
});
