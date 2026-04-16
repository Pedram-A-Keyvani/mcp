import { Component, inject } from '@angular/core';
import { UxModelService } from '../../core/ux/ux-model.service';
import { portalState } from '../portal.state';

@Component({
  selector: 'app-badge-bar',
  standalone: true,
  styleUrl: './badge-bar.component.css',
  template: `
    <div class="badges">
      @for (b of badges(); track b.id) {
        <button (click)="select(b.id)" [class.selected]="b.id === portalState.badge()">
          {{ b.label }}
        </button>
      }
    </div>
  `
})
export class BadgeBarComponent {
  private ux = inject(UxModelService);

  badges = this.ux.badges;
  portalState = portalState;

  select(id: string) {
    portalState.badge.set(id);
    portalState.action.set(null);
  }
}