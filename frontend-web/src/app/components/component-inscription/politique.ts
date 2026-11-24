import { Component } from '@angular/core';
import { Banner } from '../component-banner/banner';
import { DocumentReading } from './document-reading';

@Component({
  imports: [Banner, DocumentReading],
  selector: 'app-component-politique',
  styleUrl: './politique.css',
  templateUrl: './politique.html',
})
export class ComponentPolitique {}
