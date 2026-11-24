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

  constructor() {
    afterNextRender(() => this.checkBottom());
  }

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
