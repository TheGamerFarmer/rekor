import {
  afterNextRender,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';

export type AgreementDocument = 'privacyPolicy' | 'internalRules';

/** Builds the BroadcastChannel name shared by the reader and registration page. */
export function readingChannelName(id: string): string {
  return `rekor-document-reading-${id}`;
}

@Directive({
  selector: '[appDocumentReading]',
  exportAs: 'documentReading',
})
export class DocumentReading {
  readonly document = input.required<AgreementDocument>({ alias: 'appDocumentReading' });
  readonly completed = signal(false);
  readonly readingId = new URLSearchParams(window.location.search).get('lecture');
  readonly unavailable = !!this.readingId && typeof BroadcastChannel === 'undefined';
  private readonly element = inject(ElementRef<HTMLElement>);

  /** Checks whether the document is already at its final scroll position. */
  constructor() {
    afterNextRender(() => this.checkBottom());
  }

  /** Notifies the registration page once the reader reaches the document's end. */
  @HostListener('window:scroll')
  @HostListener('window:resize')
  checkBottom(): void {
    if (
      !this.readingId ||
      this.unavailable ||
      this.completed() ||
      this.element.nativeElement.getBoundingClientRect().bottom > window.innerHeight + 1
    ) {
      return;
    }

    const channel = new BroadcastChannel(readingChannelName(this.readingId));
    channel.postMessage(this.document());
    channel.close();
    this.completed.set(true);
  }
}
