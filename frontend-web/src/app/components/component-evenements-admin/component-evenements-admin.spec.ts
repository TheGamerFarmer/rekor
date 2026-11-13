import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ComponentEvenementsAdmin } from './component-evenements-admin';
import { EvenementService } from '../../services/evenement.service';
import { defaultEvenements, type Evenement } from '../component-evenement/evenements.data';

describe('ComponentEvenementsAdmin', () => {
  let fixture: ComponentFixture<ComponentEvenementsAdmin>;
  let remove: ReturnType<typeof vi.fn>;
  let events = signal(defaultEvenements);

  beforeEach(async () => {
    events = signal(defaultEvenements);
    remove = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ComponentEvenementsAdmin],
      providers: [
        {
          provide: EvenementService,
          useValue: { evenements: events, remove },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenementsAdmin);
    fixture.detectChanges();
  });

  it('displays the administration banner and upcoming events', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Gestion des événements',
    );
    expect(fixture.nativeElement.querySelectorAll('.event-row').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('20:00');
    expect(
      fixture.nativeElement.querySelector('a[href="/admin/evenements/nouveau"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/admin/adherents"]')).toBeNull();
  });

  it('calls the service when deleting an event', () => {
    const deleteButton = fixture.nativeElement.querySelector('.delete-action') as HTMLButtonElement;
    deleteButton.click();

    expect(remove).toHaveBeenCalledWith(expect.any(Number));
  });

  it('displays participants grouped by attendance status', () => {
    const eventWithParticipants: Evenement = {
      ...defaultEvenements[0],
      date: '2099-01-01',
      participants: [
        { id: 1, name: 'Alice Martin', status: 'present' },
        { id: 2, name: 'Bob Durand', status: 'absent' },
        { id: 3, name: 'Chloé Bernard', status: 'pending' },
      ],
    };
    events.set([eventWithParticipants]);
    fixture.detectChanges();

    const participants = fixture.nativeElement.querySelector('.event-participants');
    expect(participants.textContent).toContain('Présents (1)');
    expect(participants.textContent).toContain('Alice Martin');
    expect(participants.textContent).toContain('Absents (1)');
    expect(participants.textContent).toContain('Bob Durand');
    expect(participants.textContent).toContain('En attente (1)');
    expect(participants.textContent).toContain('Chloé Bernard');
  });

  it('filters the administration list by event status', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.event-filters button');

    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Match amical - Gières vs Lyon');
    expect(fixture.nativeElement.textContent).not.toContain('Match - Gières vs Grenoble');

    buttons[0].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Match - Gières vs Grenoble');
  });

  it('shows an empty state when no events match the filter', () => {
    events.set([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')?.textContent).toContain(
      'Aucun événement',
    );
  });
});
