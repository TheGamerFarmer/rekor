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
    const clubLinks = page.querySelectorAll('a[href="/presentation-club"]');
    expect(clubLinks).toHaveLength(2);
    expect(clubLinks[0].textContent).toContain('contacter le club');
    expect(clubLinks[1].textContent).toContain('par ses canaux de contact');
    expect(page.querySelector('.document-actions button')?.textContent?.trim()).toBe(
      'Quitter la page',
    );
  });

  it('closes the page when the exit button is clicked', () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
    const button = fixture.nativeElement.querySelector('.document-close') as HTMLButtonElement;

    button.click();

    expect(closeSpy).toHaveBeenCalledOnce();
    closeSpy.mockRestore();
  });
});
