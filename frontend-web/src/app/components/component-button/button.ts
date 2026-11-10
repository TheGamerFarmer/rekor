import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
export type ButtonType = 'button' | 'submit' | 'reset';
export type ButtonIconVariant = 'light' | 'primary';
export type ButtonSize = 'default' | 'small';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
  host: {
    '[class.full-width-host]': 'fullWidth()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('default');
  readonly type = input<ButtonType>('button');
  readonly href = input<string>();
  readonly text = input.required<string>();
  readonly iconSrc = input<string>();
  readonly iconVariant = input<ButtonIconVariant>();
  readonly ariaLabel = input<string>();
  readonly ariaCurrent = input<'page' | null>();
  readonly uppercase = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
}
