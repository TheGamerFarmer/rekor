import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Banner } from './banner';

describe('Banner', () => {
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banner],
    }).compileComponents();

    fixture = TestBed.createComponent(Banner);
    fixture.componentRef.setInput('image', '/images/test.jpg');
    fixture.componentRef.setInput('title', 'Titre de test');
  });

  it('renders a title and an optional subtitle', () => {
    fixture.componentRef.setInput('subtitle', 'Sous-titre');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Titre de test');
    expect(fixture.nativeElement.querySelector('.banner-subtitle')?.textContent).toContain(
      'Sous-titre',
    );
  });

  it('renders the extended content only for the home page', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.match-strip')).toBeNull();

    fixture.componentRef.setInput('isHome', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.match-strip')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.banner')?.id).toBe('accueil');
  });

  it('renders the subtitle inside the home banner heading when provided', () => {
    fixture.componentRef.setInput('isHome', true);
    fixture.componentRef.setInput('subtitle', 'vs Grenoble');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1 span')?.textContent).toContain('vs Grenoble');
  });
});
