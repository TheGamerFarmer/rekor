import { Component, input } from '@angular/core';
import { Button } from '../component-button/button';

@Component({
  imports: [Button],
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
