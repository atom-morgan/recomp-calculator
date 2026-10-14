import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Sex } from '../../tdee';
import { InfoTip } from '../info-tip/info-tip';
import { BODY_FAT_RANGE, BODY_FAT_STOPS, BodyFatStop } from './body-fat-stops';

/** How far a value sits outside a stop's range (0 when inside it). */
const gap = (stop: BodyFatStop, value: number) =>
  value < stop.low ? stop.low - value : value > stop.high ? value - stop.high : 0;

/**
 * Body fat slider plus a grid of reference photos, so people can pick a picture instead of
 * guessing a number. Works with reactive forms. Value is a percentage.
 */
@Component({
  selector: 'app-body-fat-picker',
  imports: [InfoTip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './body-fat-picker.html',
  styleUrl: './body-fat-picker.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BodyFatPicker), multi: true },
  ],
})
export class BodyFatPicker implements ControlValueAccessor {
  readonly sex = input.required<Sex>();

  protected readonly hint =
    'Pick the picture closest to how you look now. A close guess is fine. This is a visual estimate, not a measurement.';

  protected readonly value = signal(25);
  protected readonly disabled = signal(false);

  protected readonly min = computed(() => BODY_FAT_RANGE[this.sex()].min);
  protected readonly max = computed(() => BODY_FAT_RANGE[this.sex()].max);
  protected readonly stops = computed(() => BODY_FAT_STOPS[this.sex()]);
  protected readonly nearest = computed(() =>
    this.stops().reduce((best, stop) =>
      gap(stop, this.value()) < gap(best, this.value()) ? stop : best,
    ),
  );

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  protected photoSrc(stop: BodyFatStop): string {
    return `body-fat/${this.sex()}-${stop.id}.png`;
  }

  protected set(value: number): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  protected onSlide(event: Event): void {
    this.set(+(event.target as HTMLInputElement).value);
  }

  writeValue(value: number | null): void {
    if (value !== null) this.value.set(value);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
