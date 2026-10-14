import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Results } from '../results/results';
import { HOUR_OPTIONS, Inputs, STEP_OPTIONS, Sex, Units } from '../tdee';
import { BodyFatPicker } from '../ui/body-fat-picker/body-fat-picker';
import { BODY_FAT_RANGE } from '../ui/body-fat-picker/body-fat-stops';
import { SegmentOption, SegmentedControl } from '../ui/segmented-control/segmented-control';

@Component({
  selector: 'app-calculator',
  imports: [ReactiveFormsModule, SegmentedControl, BodyFatPicker, Results],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
})
export class Calculator {
  private readonly injector = inject(Injector);

  protected readonly unitOptions: SegmentOption<Units>[] = [
    { value: 'imperial', label: 'lb' },
    { value: 'metric', label: 'kg' },
  ];
  protected readonly sexOptions: SegmentOption<Sex>[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];
  protected readonly ageOptions: SegmentOption<boolean>[] = [
    { value: false, label: 'Under 60' },
    { value: true, label: '60 or over' },
  ];
  protected readonly stepOptions = STEP_OPTIONS;
  protected readonly hourOptions = HOUR_OPTIONS;

  protected readonly sexHint =
    'Sets the lowest calorie level we will suggest and which body fat pictures you see. Your maintenance calories come from your lean mass, so they are not affected.';
  protected readonly ageHint =
    'At 60 and over, fat loss uses a slightly smaller calorie deficit and protein goes up a little, to help protect muscle.';

  protected readonly form = inject(NonNullableFormBuilder).group({
    units: ['imperial' as Units],
    sex: ['male' as Sex],
    weight: [null as number | null, [Validators.required, Validators.min(1)]],
    bodyFat: [25],
    stepIdx: [1],
    hourIdx: [2],
    senior: [false],
  });

  protected readonly units = toSignal(this.form.controls.units.valueChanges, {
    initialValue: this.form.controls.units.value,
  });
  protected readonly sex = toSignal(this.form.controls.sex.valueChanges, {
    initialValue: this.form.controls.sex.value,
  });

  /** The inputs the current results were calculated from. */
  protected readonly submitted = signal<Inputs | null>(null);
  private readonly results = viewChild(Results, { read: ElementRef });

  constructor() {
    // The slider range depends on sex, so keep the chosen body fat inside it when sex changes.
    this.form.controls.sex.valueChanges.pipe(takeUntilDestroyed()).subscribe((sex) => {
      const { min, max } = BODY_FAT_RANGE[sex];
      const bodyFat = this.form.controls.bodyFat;
      bodyFat.setValue(Math.min(max, Math.max(min, bodyFat.value)));
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { weight, ...rest } = this.form.getRawValue();
    if (weight === null) return; // unreachable once valid; narrows the type
    this.submitted.set({ ...rest, weight });

    afterNextRender(() => this.results()?.nativeElement.scrollIntoView(), { injector: this.injector });
  }
}
