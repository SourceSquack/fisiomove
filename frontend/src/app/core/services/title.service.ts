import { Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private readonly _title = signal<string>('');
  get title(): Signal<string> {
    return this._title;
  }
  setTitle(newTitle: string) {
    this._title.set(newTitle);
  }
}
