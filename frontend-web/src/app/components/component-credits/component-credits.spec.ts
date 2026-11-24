import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentCredits } from './component-credits';

describe('ComponentCredits', () => {
  let fixture: ComponentFixture<ComponentCredits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCredits],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCredits);
    await fixture.whenStable();
  });

  it('renders credit links for image sources and the fonts used by the site', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('Crédits');
    expect(page.querySelectorAll('.credit-card')).toHaveLength(7);
    expect(page.textContent).toContain('DM Sans');
    expect(page.textContent).toContain('Barlow Condensed');
    expect(page.textContent).toContain('Roboto');
    expect(page.querySelector('a[href="https://www.pexels.com/"]')).not.toBeNull();
  });
});
