import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { track } from '../analytics';
import { Results } from '../results/results';
import { HOUR_OPTIONS, Inputs, LB_TO_KG, STEP_OPTIONS, Sex, Units } from '../tdee';
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

    // Convert the weight when units change, so 175 lb doesn't become 175 kg. Always convert
    // from what the user last typed, so switching lb -> kg -> lb gives back the same number.
    const { units, weight } = this.form.controls;
    let typed = { weight: weight.value, units: units.value };
    weight.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      typed = { weight: value, units: units.value };
    });
    units.valueChanges.pipe(takeUntilDestroyed()).subscribe((to) => {
      if (typed.weight === null) return;
      const converted =
        to === typed.units
          ? typed.weight
          : to === 'metric'
            ? Math.round(typed.weight * LB_TO_KG * 10) / 10
            : Math.round(typed.weight / LB_TO_KG);
      // emitEvent: false so the converted number isn't mistaken for a new typed value
      weight.setValue(converted, { emitEvent: false });
    });
  }

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { weight, ...rest } = this.form.getRawValue();
    if (weight === null) return;
    this.submitted.set({ ...rest, weight });
    track('calculate');

    afterNextRender(() => this.results()?.nativeElement.scrollIntoView(), { injector: this.injector });
  }
}
