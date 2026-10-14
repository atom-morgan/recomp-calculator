import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InfoTip } from '../info-tip/info-tip';

export interface SegmentOption<T> {
  readonly value: T;
  readonly label: string;
}

let nextId = 0;

/**
 * A radio group styled as a segmented control, with an optional info tip on the label.
 * Works with reactive forms (formControlName / formControl) and uses native radios
 * for keyboard support.
 */
@Component({
  selector: 'app-segmented-control',
  imports: [InfoTip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './segmented-control.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SegmentedControl), multi: true },
  ],
  template: `
    <fieldset [disabled]="disabled()">
      <legend class="lbl">
        <span class="label-row">
          {{ label() }}
          @if (hint(); as text) {
            <app-info-tip [text]="text" />
          }
        </span>
      </legend>
      <div class="seg">
        @for (option of options(); track option.label) {
          <label [class.on]="option.value === value()">
            <input
              type="radio"
              [name]="name"
              [checked]="option.value === value()"
              (change)="select(option.value)"
              (blur)="onTouched()"
            />
            {{ option.label }}
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class SegmentedControl<T> implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly options = input.required<readonly SegmentOption<T>[]>();

  protected readonly name = `segmented-${nextId++}`;
  protected readonly value = signal<T | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  protected select(value: T) {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
