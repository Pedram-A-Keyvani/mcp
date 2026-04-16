import { Injectable, computed } from '@angular/core';
import { OpenApiLoaderService } from '../openapi/openapi-loader.service';

@Injectable({ providedIn: 'root' })
export class UxModelService {

  constructor(private loader: OpenApiLoaderService) {}

  private get spec() {
    return this.loader.spec();
  }

  private get paths() {
    return this.spec?.paths ?? {};
  }

  badges = computed(() => {
    const tags = new Set<string>();

    for (const methods of Object.values(this.paths)) {
      for (const op of Object.values(methods as any)) {
        (op as any)?.tags?.forEach((t: string) => tags.add(t));
      }
    }

    return Array.from(tags).map(t => ({
      id: t,
      label: this.humanize(t)
    }));
  });

  getActions(tag: string) {
    const ops: any[] = [];

    for (const [path, methods] of Object.entries(this.paths)) {
      for (const [method, op] of Object.entries(methods as any)) {
        if ((op as any)?.tags?.includes(tag)) {
          ops.push({
            id: (op as any)?.operationId ?? path,
            label: this.humanize((op as any)?.summary ?? method),
            method,
            path
          });
        }
      }
    }

    return ops;
  }

  private humanize(str: string) {
    return (str ?? '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}