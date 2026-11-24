import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DocumentReading } from './document-reading';

@Component({
  imports: [DocumentReading],
  template: '<article appDocumentReading="privacyPolicy"></article>',
})
class TestDocument {}

describe('DocumentReading', () => {
  const postMessage = vi.fn();
  const close = vi.fn();
  const originalUrl = window.location.href;
  let bottom: number;

  beforeEach(() => {
    bottom = 1500;
    postMessage.mockReset();
    close.mockReset();
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        constructor(readonly name: string) {}
        postMessage = postMessage;
        close = close;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ bottom }) as DOMRect,
    );
    history.replaceState({}, '', '/politique-confidentialite?lecture=registration-id');
  });

  afterEach(() => {
    history.replaceState({}, '', originalUrl);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('reports the document only after its bottom reaches the viewport', async () => {
    const fixture = TestBed.createComponent(TestDocument);
    fixture.detectChanges();
    await fixture.whenStable();

    window.dispatchEvent(new Event('scroll'));
    expect(postMessage).not.toHaveBeenCalled();

    bottom = window.innerHeight;
    window.dispatchEvent(new Event('scroll'));
    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage).toHaveBeenCalledWith('privacyPolicy');
    expect(close).toHaveBeenCalledOnce();

    window.dispatchEvent(new Event('scroll'));
    expect(postMessage).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('reports a document that already fits on screen', async () => {
    bottom = 0;
    const fixture = TestBed.createComponent(TestDocument);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(postMessage).toHaveBeenCalledWith('privacyPolicy');
    fixture.destroy();
  });

  it('does not report a document opened outside registration', async () => {
    history.replaceState({}, '', '/politique-confidentialite');
    bottom = 0;
    const fixture = TestBed.createComponent(TestDocument);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(postMessage).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
