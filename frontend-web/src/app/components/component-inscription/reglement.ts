import { Component } from '@angular/core';
import { Banner } from '../component-banner/banner';
import { DocumentReading } from './document-reading';

@Component({
  imports: [Banner, DocumentReading],
  selector: 'app-component-reglement',
  styleUrl: './reglement.css',
  templateUrl: './réglement.html',
})
export class ComponentReglement {
  closePage(): void {
    window.close();
  }
}
