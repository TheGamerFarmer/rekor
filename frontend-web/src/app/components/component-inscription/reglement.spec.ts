import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentReglement } from './reglement';

describe('ComponentReglement', () => {
  let fixture: ComponentFixture<ComponentReglement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentReglement],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentReglement);
    fixture.detectChanges();
  });

  it('displays the club regulations as a separate page', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('app-component-banner')?.getAttribute('title')).toBe(
      'Règlement intérieur',
    );
    expect(page.querySelectorAll('.reglement-article')).toHaveLength(15);
    expect(page.textContent).toContain('Article 15 – Modification et entrée en vigueur');
    expect(page.textContent).not.toContain('Politique de confidentialité');
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
