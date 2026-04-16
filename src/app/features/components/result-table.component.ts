import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type Row = Record<string, unknown>;

interface TableModel {
  kind: 'table';
  columns: string[];
  rows: Row[];
  total: number;
}

interface KvModel {
  kind: 'kv';
  entries: { key: string; value: unknown }[];
}

interface EmptyModel   { kind: 'empty' }
interface ScalarModel  { kind: 'scalar'; value: unknown }
interface LoadingModel { kind: 'loading' }
interface ErrorModel   { kind: 'error'; message: string }

type ViewModel =
  | TableModel
  | KvModel
  | EmptyModel
  | ScalarModel
  | LoadingModel
  | ErrorModel;

/** Keys commonly wrapping a list payload in REST responses. */
const LIST_KEYS = ['items', 'results', 'data', 'content', 'records', 'entries'];

@Component({
  selector: 'app-result-table',
  standalone: true,
  styleUrl: './result-table.component.css',
  template: `
    @switch (model().kind) {

      @case ('loading') {
        <div class="state state--loading">
          <span class="spinner"></span>
          <span>Running…</span>
        </div>
      }

      @case ('error') {
        <div class="state state--error">
          <span class="dot"></span>
          <span>{{ $any(model()).message }}</span>
        </div>
      }

      @case ('empty') {
        <div class="state state--empty">No results.</div>
      }

      @case ('scalar') {
        <div class="scalar">
          <pre>{{ format($any(model()).value) }}</pre>
        </div>
      }

      @case ('kv') {
        <div class="kv">
          @for (e of $any(model()).entries; track e.key) {
            <div class="kv-row">
              <div class="kv-key">{{ e.key }}</div>
              <div class="kv-val" [title]="tooltip(e.value)">
                <ng-container
                  [ngTemplateOutlet]="cell"
                  [ngTemplateOutletContext]="{ $implicit: e.value }" />
              </div>
            </div>
          }
        </div>
      }

      @case ('table') {
        @let m = $any(model());
        <div class="table-wrap">
          <div class="meta">
            <span class="count">{{ m.total }}</span>
            <span class="count-label">{{ m.total === 1 ? 'row' : 'rows' }}</span>
            <span class="divider">·</span>
            <span class="count">{{ m.columns.length }}</span>
            <span class="count-label">{{ m.columns.length === 1 ? 'column' : 'columns' }}</span>
          </div>
          <div class="scroll">
            <table>
              <thead>
                <tr>
                  @for (c of m.columns; track c) {
                    <th>{{ c }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of m.rows; track $index) {
                  <tr>
                    @for (c of m.columns; track c) {
                      <td [title]="tooltip(row[c])">
                        <ng-container
                          [ngTemplateOutlet]="cell"
                          [ngTemplateOutletContext]="{ $implicit: row[c] }" />
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    }

    <!-- Shared cell renderer -->
    <ng-template #cell let-v>
      @if (v === null || v === undefined) {
        <span class="muted">—</span>
      } @else if (v === true || v === false) {
        <span class="pill" [class.pill--on]="v">{{ v }}</span>
      } @else if (isArray(v)) {
        <span class="token">[ {{ v.length }} ]</span>
      } @else if (isObject(v)) {
        <span class="token">&#123;…&#125;</span>
      } @else {
        <span class="val">{{ v }}</span>
      }
    </ng-template>
  `,
  imports: [NgTemplateOutlet]
})
export class ResultTableComponent {

  /** Raw payload from the API (array / object / primitive), or one of the control states. */
  data    = input<unknown>(null);
  loading = input<boolean>(false);
  error   = input<string | null>(null);

  model = computed<ViewModel>(() => {
    if (this.loading()) return { kind: 'loading' };

    const err = this.error();
    if (err) return { kind: 'error', message: err };

    const raw = this.data();
    if (raw === null || raw === undefined) return { kind: 'empty' };

    const list = this.extractList(raw);

    if (list) {
      if (list.length === 0) return { kind: 'empty' };
      const columns = this.deriveColumns(list);
      return { kind: 'table', columns, rows: list, total: list.length };
    }

    if (this.isPlainObject(raw)) {
      const entries = Object.entries(raw).map(([key, value]) => ({ key, value }));
      if (entries.length === 0) return { kind: 'empty' };
      return { kind: 'kv', entries };
    }

    return { kind: 'scalar', value: raw };
  });

  // ── Template helpers ────────────────────────────────────────
  isArray(v: unknown): v is unknown[] { return Array.isArray(v); }
  isObject(v: unknown): boolean { return this.isPlainObject(v); }

  format(v: unknown): string {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  }

  tooltip(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v !== 'object') return String(v);
    try {
      const s = JSON.stringify(v, null, 2);
      return s.length > 600 ? s.slice(0, 600) + '…' : s;
    } catch { return ''; }
  }

  // ── Normalization ───────────────────────────────────────────
  private extractList(raw: unknown): Row[] | null {
    if (Array.isArray(raw)) return raw.map(r => this.asRow(r));

    if (this.isPlainObject(raw)) {
      for (const k of LIST_KEYS) {
        const v = (raw as any)[k];
        if (Array.isArray(v)) return v.map(r => this.asRow(r));
      }
    }
    return null;
  }

  /** Coerce a list item into a row. Primitives become { value: … }. */
  private asRow(item: unknown): Row {
    if (this.isPlainObject(item)) return item as Row;
    return { value: item };
  }

  /** Union of keys across rows, ordered by first-seen, capped for sanity. */
  private deriveColumns(rows: Row[]): string[] {
    const seen = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) seen.add(key);
    }
    const cols = Array.from(seen);
    return cols.length > 24 ? cols.slice(0, 24) : cols;
  }

  private isPlainObject(v: unknown): v is Row {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }
}