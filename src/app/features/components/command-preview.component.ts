import { Component, computed, Inject } from '@angular/core';
import { portalState } from '../portal.state';

@Component({
  selector: 'app-command-preview',
  standalone: true,
  styleUrl: './command-preview.component.css',
  template: `
    @if (command(); as cmd) {
      <div class="preview">
        <div>{{ cmd.method }} {{ cmd.path }}</div>
        <div>{{ cmd.refinement }}</div>
        <button (click)="execute()">Run</button>
      </div>
    }
  `
})
export class CommandPreviewComponent {

  constructor(@Inject('APP_CONFIG') private config: any) { }

  command = computed(() => {
    const a = portalState.action();
    if (!a) return null;

    return {
      method: a.method,
      path: a.path,
      refinement: portalState.refinement()
    };
  });

  async execute() {
    const cmd = this.command();
    if (!cmd) return;

    if (cmd.method.toUpperCase() === 'GET') {
      const url = new URL(`/api/${cmd.path}`, window.location.origin);
      if (cmd.refinement) {
        url.searchParams.set('q', cmd.refinement);
      }
      await fetch(url.toString(), {
        method: cmd.method,
        headers: {
          'authorization': `Bearer ${this.config.token}`
        }
      });
    } else {
      await fetch(`/api/${cmd.path}`, {
        method: cmd.method,
        headers: {
          'authorization': `Bearer ${this.config.token}`
        },
        body: cmd.refinement
      });
    }
    console.log('EXEC:', cmd);
  }
}