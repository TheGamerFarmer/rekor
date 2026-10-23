import { Component, input } from '@angular/core';

@Component({
  selector: 'app-component-banner',
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  readonly image = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly isHome = input(false);
}
