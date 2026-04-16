import { Component } from '@angular/core';
import { portalState } from '../portal.state';

@Component({
  selector: 'app-refine-input',
  standalone: true,
  styleUrl: './refine-input.component.css',
  template: `
    @if (action()) {
      <input
        class="refine"
        placeholder="Refine request..."
        (input)="onInput($any($event.target).value)"
      />
    }
  `
})
export class RefineInputComponent {
  action = portalState.action;

  onInput(value: string) {
    portalState.refinement.set(value);
  }
}