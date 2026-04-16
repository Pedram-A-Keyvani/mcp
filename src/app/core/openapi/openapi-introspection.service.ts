import { Injectable } from '@angular/core';
import { OpenApiLoaderService } from './openapi-loader.service';

@Injectable({ providedIn: 'root' })
export class OpenApiIntrospectionService {

  constructor(private loader: OpenApiLoaderService) {}

  getTags(): string[] {
    const spec = this.loader.spec();
    const paths = spec?.paths ?? {};

    const tags = new Set<string>();

    for (const methods of Object.values(paths)) {
      for (const op of Object.values(methods as any)) {
        (op as any)?.tags?.forEach((t: string) => tags.add(t));
      }
    }

    return Array.from(tags);
  }

  getOperationsByTag(tag: string) {
    const spec = this.loader.spec();
    const paths = spec?.paths ?? {};

    const ops: any[] = [];

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, op] of Object.entries(methods as any)) {
        if ((op as any)?.tags?.includes(tag)) {
          ops.push({ path, method, ...(op as any) });
        }
      }
    }

    return ops;
  }
}