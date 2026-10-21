import { Component, input } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  readonly backendStatus = input('…');
}
