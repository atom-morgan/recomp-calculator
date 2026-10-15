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
  private injector = inject(Injector);

  protected unitOptions: SegmentOption<Units>[] = [
    { value: 'imperial', label: 'lb' },
    { value: 'metric', label: 'kg' },
  ];
  protected sexOptions: SegmentOption<Sex>[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];
  protected ageOptions: SegmentOption<boolean>[] = [
    { value: false, label: 'Under 60' },
    { value: true, label: '60 or over' },
  ];
  protected stepOptions = STEP_OPTIONS;
  protected hourOptions = HOUR_OPTIONS;

  protected form = inject(NonNullableFormBuilder).group({
    units: ['imperial' as Units],
    sex: ['male' as Sex],
    weight: [null as number | null, [Validators.required, Validators.min(1)]],
    bodyFat: [25],
    stepIdx: [1],
    hourIdx: [2],
    senior: [false],
  });

  protected units = toSignal(this.form.controls.units.valueChanges, {
    initialValue: this.form.controls.units.value,
  });
  protected sex = toSignal(this.form.controls.sex.valueChanges, {
    initialValue: this.form.controls.sex.value,
  });

  // the inputs the current results were calculated from
  protected submitted = signal<Inputs | null>(null);
  private results = viewChild(Results, { read: ElementRef });

  constructor() {
    // the slider range depends on sex, so keep body fat inside it when sex changes
    this.form.controls.sex.valueChanges.pipe(takeUntilDestroyed()).subscribe((sex) => {
      const { min, max } = BODY_FAT_RANGE[sex];
      const bodyFat = this.form.controls.bodyFat;
      bodyFat.setValue(Math.min(max, Math.max(min, bodyFat.value)));
    });
  }

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { weight, ...rest } = this.form.getRawValue();
    if (weight === null) return;
    this.submitted.set({ ...rest, weight });

    afterNextRender(() => this.results()?.nativeElement.scrollIntoView(), { injector: this.injector });
  }
}
