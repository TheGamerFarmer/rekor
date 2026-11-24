import { TestBed } from '@angular/core/testing';
import { ComponentPolitique } from './politique';
import { ComponentReglement } from './reglement';

describe.each([
  ['politique', ComponentPolitique],
  ['règlement', ComponentReglement],
] as const)('indications de lecture : %s', (_name, component) => {
  const originalUrl = window.location.href;
  let bottom: number;

  beforeEach(() => {
    bottom = 1500;
    history.replaceState({}, '', '?lecture=test');
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ bottom }) as DOMRect,
    );
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        postMessage = vi.fn();
        close = vi.fn();
      },
    );
    TestBed.configureTestingModule({ imports: [component] });
  });

  afterEach(() => {
    history.replaceState({}, '', originalUrl);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('indique comment terminer la lecture puis confirme la fin', async () => {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Faites défiler ce document');

    bottom = window.innerHeight;
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Vous avez atteint la fin du document');
    fixture.destroy();
  });

  it('signale un navigateur qui ne permet pas de confirmer la lecture', () => {
    vi.stubGlobal('BroadcastChannel', undefined);
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Votre navigateur ne permet pas de confirmer la lecture',
    );
    fixture.destroy();
  });
});
