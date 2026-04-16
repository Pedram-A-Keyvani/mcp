import { Component, inject, OnInit } from '@angular/core';
import { OpenApiLoaderService } from '../../core/openapi/openapi-loader.service';
import { ActionBarComponent } from '../components/action-bar.component';
import { BadgeBarComponent } from '../components/badge-bar.component';
import { CommandPreviewComponent } from '../components/command-preview.component';
import { ResultTableComponent } from '../components/result-table.component';
import { portalState } from '../portal.state';

@Component({
  selector: 'app-portal',
  standalone: true,
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.css',
  imports: [
    BadgeBarComponent,
    ActionBarComponent,
    CommandPreviewComponent,
    ResultTableComponent
  ]
})
export class PortalComponent implements OnInit {

  portalState = portalState;

  private loader = inject(OpenApiLoaderService);

  async ngOnInit() {
    await this.loader.load(
      '/openapi?v=default.yaml'
    );
  }
}