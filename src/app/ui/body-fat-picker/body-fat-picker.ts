import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Sex } from '../../tdee';
import { InfoTip } from '../info-tip/info-tip';
import { BODY_FAT_RANGE, BODY_FAT_STOPS, BodyFatStop } from './body-fat-stops';

// how far a value is outside a stop's range (0 if it's inside)
const gap = (stop: BodyFatStop, value: number) =>
  value < stop.low ? stop.low - value : value > stop.high ? value - stop.high : 0;

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
  sex = input.required<Sex>();

  protected value = signal(25);
  protected disabled = signal(false);

  protected min = computed(() => BODY_FAT_RANGE[this.sex()].min);
  protected max = computed(() => BODY_FAT_RANGE[this.sex()].max);
  protected stops = computed(() => BODY_FAT_STOPS[this.sex()]);
  protected nearest = computed(() =>
    this.stops().reduce((best, stop) =>
      gap(stop, this.value()) < gap(best, this.value()) ? stop : best,
    ),
  );

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  protected photoSrc(stop: BodyFatStop) {
    return `body-fat/${this.sex()}-${stop.id}.png`;
  }

  protected set(value: number) {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  protected onSlide(event: Event) {
    this.set(+(event.target as HTMLInputElement).value);
  }

  writeValue(value: number | null) {
    if (value !== null) this.value.set(value);
  }
  registerOnChange(fn: (value: number) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }
}
