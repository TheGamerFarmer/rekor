import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRegles } from './component-regles';

describe('ComponentRegles', () => {
  let fixture: ComponentFixture<ComponentRegles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentRegles],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentRegles);
    await fixture.whenStable();
  });

  it('renders the game rules sections', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('Règles du jeu');
    expect(page.textContent).toContain('Comment ça se joue ?');
    expect(page.textContent).toContain('Les règles principales');
    expect(page.querySelectorAll('.step')).toHaveLength(4);
  });
});
