import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Button } from './components/component-button/button';

@Component({
  imports: [Button, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
