import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';

let nextId = 0;

// "?" button with a tooltip. Hover and focus show it, click toggles it for touch screens.
@Component({
  selector: 'app-info-tip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './info-tip.css',
  host: { '(document:click)': 'closeOnOutsideClick($event)' },
  template: `
    <button
      type="button"
      class="tip"
      aria-label="More info"
      [attr.aria-describedby]="id"
      (click)="open.set(!open())"
      (keydown.escape)="open.set(false)"
    >?</button>
    <span class="bubble" role="tooltip" [id]="id" [class.open]="open()">{{ text() }}</span>
  `,
})
export class InfoTip {
  text = input.required<string>();

  protected id = `info-tip-${nextId++}`;
  protected open = signal(false);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected closeOnOutsideClick(event: Event) {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
