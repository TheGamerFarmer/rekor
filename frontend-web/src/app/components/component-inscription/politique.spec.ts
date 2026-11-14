import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentPolitique } from './politique';

describe('ComponentPolitique', () => {
  let fixture: ComponentFixture<ComponentPolitique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentPolitique],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentPolitique);
    fixture.detectChanges();
  });

  it('displays the privacy policy sections', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('app-component-banner')?.getAttribute('title')).toBe(
      'Politique de confidentialité',
    );
    expect(page.querySelectorAll('.privacy-section')).toHaveLength(10);
    expect(page.textContent).toContain('Droits des personnes concernées');
    expect(page.querySelector('a[href="/#contact"]')).not.toBeNull();
  });
});
