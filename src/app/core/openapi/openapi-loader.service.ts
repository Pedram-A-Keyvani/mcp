import { Injectable, signal } from '@angular/core';
import * as yaml from 'js-yaml';

@Injectable({ providedIn: 'root' })
export class OpenApiLoaderService {
  spec = signal<any>(null);

  async load(url: string) {
    const res = await fetch(url);
    const text = await res.text(); // IMPORTANT: YAML is text
    const parsed = yaml.load(text);

    this.spec.set(parsed);
    return parsed;
  }
}