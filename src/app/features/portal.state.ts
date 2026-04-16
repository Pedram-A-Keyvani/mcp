import { signal } from '@angular/core';

export const portalState = {
  badge: signal<string | null>(null),
  action: signal<any>(null),
  refinement: signal(''),

  // ── Execution result ──────────────────────────────
  result:  signal<unknown>(null),
  running: signal<boolean>(false),
  error:   signal<string | null>(null),
};