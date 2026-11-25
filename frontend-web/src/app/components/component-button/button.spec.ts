import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Button] }).compileComponents();
    fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('text', 'Test');
  });

  it('renders the default button variant and type', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.type).toBe('button');
    expect(button.classList).toContain('button-primary');
  });

  it('supports button variants, disabled state, and links', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.classList).toContain('button-danger');

    fixture.componentRef.setInput('href', '/actualites');
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('variant', 'outline');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/actualites');
    expect(link.classList).toContain('button-outline');
  });

  it('renders an icon inside a button element', () => {
    fixture.componentRef.setInput('iconSrc', '/icons/arrow.png');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('button .button-icon') as HTMLImageElement;
    expect(icon).not.toBeNull();
    expect(icon.getAttribute('src')).toBe('/icons/arrow.png');
  });
});
