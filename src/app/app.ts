import { Component } from '@angular/core';
import { Calculator } from './calculator/calculator';

@Component({
  selector: 'app-root',
  imports: [Calculator],
  template: '<app-calculator />',
})
export class App {}
