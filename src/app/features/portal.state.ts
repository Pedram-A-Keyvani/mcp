import { signal } from '@angular/core';

export const portalState = {
  badge: signal<string | null>(null),
  action: signal<any>(null),
  refinement: signal('')
};