import { Component, computed, Inject } from '@angular/core';
import { portalState } from '../portal.state';
import { APP_CONFIG } from '../../app.config';

@Component({
  selector: 'app-command-preview',
  standalone: true,
  styleUrl: './command-preview.component.css',
  template: `
    @if (command(); as cmd) {
      <div class="preview">
        <div>{{ cmd.method }} {{ cmd.path }}</div>
        <div>{{ cmd.refinement }}</div>
        <button (click)="execute()" [disabled]="portalState.running()">
          {{ portalState.running() ? 'Running…' : 'Run' }}
        </button>
      </div>
    }
  `
})
export class CommandPreviewComponent {

  portalState = portalState;

  constructor(@Inject(APP_CONFIG) private config: any) { }

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

    // Reset prior state
    portalState.running.set(true);
    portalState.error.set(null);
    portalState.result.set(null);

    try {
      let res: Response;

      if (cmd.method.toUpperCase() === 'GET') {
        const url = new URL(`/api/${cmd.path}`, window.location.origin);
        if (cmd.refinement) {
          url.searchParams.set('q', cmd.refinement);
        }
        res = await fetch(url.toString(), {
          method: cmd.method,
          headers: {
            'authorization': `Bearer ${this.config.token}`
          }
        });
      } else {
        res = await fetch(`/api/${cmd.path}`, {
          method: cmd.method,
          headers: {
            'authorization': `Bearer ${this.config.token}`,
            'content-type': 'application/json'
          },
          body: cmd.refinement || undefined
        });
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`);
      }

      const payload = await this.parseBody(res);
      portalState.result.set(payload);

    } catch (e: any) {
      portalState.error.set(e?.message ?? String(e));
    } finally {
      portalState.running.set(false);
    }
  }

  /** Parse by content-type; fall back to text for non-JSON responses. */
  private async parseBody(res: Response): Promise<unknown> {
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) return res.json();

    const text = await res.text();
    if (!text) return null;

    // Some APIs return JSON without the header — try opportunistically.
    try { return JSON.parse(text); } catch { return text; }
  }
}