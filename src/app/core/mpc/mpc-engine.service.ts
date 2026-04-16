import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MpcEngineService {

  rankIntent(input: string, operations: any[]) {
    const q = input.toLowerCase();

    return operations
      .map(op => ({
        op,
        score: this.score(op, q)
      }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.op);
  }

  private score(op: any, q: string): number {
    let s = 0;

    if (op.path?.toLowerCase().includes(q)) s += 3;
    if (op.summary?.toLowerCase().includes(q)) s += 5;
    if (op.operationId?.toLowerCase().includes(q)) s += 4;

    return s;
  }
}