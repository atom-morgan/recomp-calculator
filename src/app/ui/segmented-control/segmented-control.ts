import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InfoTip } from '../info-tip/info-tip';

export interface SegmentOption<T> {
  value: T;
  label: string;
}

let nextId = 0;

// Radio group styled as a segmented control. Native radios give us keyboard support for free.
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
  label = input.required<string>();
  hint = input<string>();
  options = input.required<SegmentOption<T>[]>();

  protected name = `segmented-${nextId++}`;
  protected value = signal<T | null>(null);
  protected disabled = signal(false);

  private onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  protected select(value: T) {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T) {
    this.value.set(value);
  }
  registerOnChange(fn: (value: T) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }
}
