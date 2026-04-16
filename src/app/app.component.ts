import { Component } from '@angular/core';
import { PortalComponent } from './features/portal/portal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PortalComponent],
  template: `<app-portal></app-portal>`
})
export class AppComponent {

}