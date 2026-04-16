import { Component, inject } from '@angular/core';
import { UxModelService } from '../../core/ux/ux-model.service';
import { portalState } from '../portal.state';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  styleUrl: './action-bar.component.css',
  template: `
    @if (badge()) {
      <div class="actions">
        @for (a of actions; track a.id) {
          <button (click)="select(a)" [class.selected]="a.id === portalState.action()?.id">
            {{ a.label }}
          </button>
        }
      </div>
    }
  `
})
export class ActionBarComponent {
  private ux = inject(UxModelService);

  badge = portalState.badge;
  portalState = portalState;

  get actions() {
    const b = this.badge();
    return b ? this.ux.getActions(b) : [];
  }

  select(action: any) {
    portalState.action.set(action);
  }
}