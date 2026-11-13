import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentEvenementAdmin } from './component-evenement-admin';
import { EvenementService } from '../../services/evenement.service';
import { defaultEvenements } from '../component-evenement/evenements.data';

describe('ComponentEvenementAdmin', () => {
  let fixture: ComponentFixture<ComponentEvenementAdmin>;
  let add: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    add = vi.fn();
    update = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ComponentEvenementAdmin],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: EvenementService,
          useValue: { findBySlug: () => undefined, add, update },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenementAdmin);
    fixture.detectChanges();
  });

  it('requires the event form fields', () => {
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('small').length).toBeGreaterThan(0);
    expect(add).not.toHaveBeenCalled();
  });

  it('adds a valid event through the service', () => {
    fixture.componentInstance['eventForm'].patchValue({
      name: 'Nouveau match',
      type: 'Match amical',
      date: '2026-12-12',
      time: '18:00',
      place: 'Gymnase de Gières',
      group: 'Seniors',
      description: 'Un match amical à domicile.',
    });

    fixture.nativeElement.querySelector('button[type="submit"]').click();

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nouveau match' }));
  });

  it('loads an existing event for editing', async () => {
    const event = defaultEvenements[0];
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ComponentEvenementAdmin],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => event.slug } } },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: EvenementService,
          useValue: { findBySlug: () => event, add, update },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEvenementAdmin);
    fixture.detectChanges();

    expect(fixture.componentInstance['isEditing']()).toBe(true);
    expect(fixture.componentInstance['eventForm'].getRawValue().name).toBe(event.name);
  });
});
