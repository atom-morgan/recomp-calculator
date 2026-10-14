import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';

let nextId = 0;

/**
 * A "?" button with a tooltip. Opens on hover and keyboard focus, and toggles on tap/click
 * so it works on touch screens. The bubble positions against the nearest positioned
 * ancestor (give the label row `position: relative`).
 */
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
  readonly text = input.required<string>();

  protected readonly id = `info-tip-${nextId++}`;
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected closeOnOutsideClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
