import { Component, inject, OnInit } from '@angular/core';
import { OpenApiLoaderService } from '../../core/openapi/openapi-loader.service';
import { ActionBarComponent } from '../components/action-bar.component';
import { BadgeBarComponent } from '../components/badge-bar.component';
import { RefineInputComponent } from '../components/refine-input.component';
import { CommandPreviewComponent } from '../components/command-preview.component';

@Component({
  selector: 'app-portal',
  standalone: true,
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.css',
  imports: [
    BadgeBarComponent,
    ActionBarComponent,
    RefineInputComponent,
    CommandPreviewComponent
  ]
})
export class PortalComponent implements OnInit {

  private loader = inject(OpenApiLoaderService);

  async ngOnInit() {
    await this.loader.load(
      '/openapi?v=default.yaml'
    );
  }
}