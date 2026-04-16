import { Component, computed, Inject } from '@angular/core';
import { portalState } from '../portal.state';
import { APP_CONFIG } from '../../app.config';

@Component({
  selector: 'app-command-preview',
  standalone: true,
  styleUrl: './command-preview.component.css',
  template: `
    <div class="req-bar" [class.req-bar--idle]="!command()">

      @if (command(); as cmd) {
        <span class="path">What is your request?</span>

        <span class="divider"></span>

        <input
          class="refine"
          [value]="portalState.refinement()"
          (input)="onRefine($any($event.target).value)"
          (keydown.enter)="execute()"
          [placeholder]="refinePlaceholder(cmd.method)" />

        <button
          class="run"
          (click)="execute()"
          [disabled]="portalState.running()">
          @if (portalState.running()) {
            <span class="spinner"></span>
            <span>Processing</span>
          } @else {
            <span>Go</span>
            <span class="kbd">↵</span>
          }
        </button>
      } @else {
        <span class="hint">
          <span class="hint-dot"></span>
          Select a domain, then an action
        </span>
      }

    </div>
  `
})
export class CommandPreviewComponent {

  portalState = portalState;

  constructor(@Inject(APP_CONFIG) private config: any) { }

  command = computed(() => {
    const a = portalState.action();
    if (!a) return null;

    return {
      method: a.method?.toUpperCase() ?? 'GET',
      path: a.path,
    };
  });

  onRefine(value: string) {
    portalState.refinement.set(value);
  }

  refinePlaceholder(method: string): string {
    return '';
  }

  async execute() {
    const cmd = this.command();
    if (!cmd || portalState.running()) return;

    const refinement = portalState.refinement();

    portalState.running.set(true);
    portalState.error.set(null);
    portalState.result.set(null);

    try {
      let res: Response;

      if (cmd.method === 'GET') {
        const url = new URL(`/api/${cmd.path}`, window.location.origin);
        if (refinement) url.searchParams.set('q', refinement);
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
          body: refinement || undefined
        });
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(
          `${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`
        );
      }

      const payload = await this.parseBody(res);
      portalState.result.set(payload);

    } catch (e: any) {
      portalState.error.set(e?.message ?? String(e));
    } finally {
      portalState.running.set(false);
    }
  }

  private async parseBody(res: Response): Promise<unknown> {
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) return res.json();

    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }
}