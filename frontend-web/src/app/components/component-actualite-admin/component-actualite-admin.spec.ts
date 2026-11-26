import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ASSOCIATION_NAME } from '../../constants';
import { ActualiteService } from '../../services/actualite.service';
import { ComponentActualiteAdmin } from './component-actualite-admin';

describe('ComponentActualiteAdmin', () => {
  let fixture: ComponentFixture<ComponentActualiteAdmin>;
  const add = vi.fn();
  const navigate = vi.fn();
  const values = {
    titre: 'Nouveau titre',
    summary: 'Un résumé',
    image: '/images/volley2.jpg',
    date: '2026-12-01',
    corps: 'Le contenu de cette actualité.',
  };
  const savedValues = { ...values, association: ASSOCIATION_NAME };

  beforeEach(async () => {
    add.mockReset();
    navigate.mockReset();
    await TestBed.configureTestingModule({
      imports: [ComponentActualiteAdmin],
      providers: [
        { provide: ActualiteService, useValue: { add } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ComponentActualiteAdmin);
    fixture.detectChanges();
  });

  it('requires every visible field and rejects whitespace-only content', () => {
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('small').length).toBe(5);
    expect(fixture.nativeElement.querySelector('#association')).toBeNull();
    fixture.componentInstance['newsForm'].patchValue({ ...values, titre: '  ' });
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    expect(add).not.toHaveBeenCalled();
  });

  it('creates an actualité and returns to the list', () => {
    fixture.componentInstance['newsForm'].setValue(values);
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    expect(add).toHaveBeenCalledWith(savedValues);
    expect(navigate).toHaveBeenCalledWith(['/actualites']);
  });

  it('reports a storage failure without navigating away', () => {
    add.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture.componentInstance['newsForm'].setValue(values);
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      "Impossible d'enregistrer",
    );
    expect(navigate).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
