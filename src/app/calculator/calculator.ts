import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Results } from '../results/results';
import { HOUR_OPTIONS, Inputs, STEP_OPTIONS, Sex, Units } from '../tdee';
import { SegmentOption, SegmentedControl } from '../ui/segmented-control/segmented-control';

@Component({
  selector: 'app-calculator',
  imports: [ReactiveFormsModule, SegmentedControl, Results],
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

  protected readonly form = inject(NonNullableFormBuilder).group({
    units: ['imperial' as Units],
    sex: ['male' as Sex],
    weight: [null as number | null, [Validators.required, Validators.min(1)]],
    bodyFat: [null as number | null, [Validators.required, Validators.min(5), Validators.max(60)]],
    stepIdx: [1],
    hourIdx: [2],
    senior: [false],
  });

  protected readonly units = toSignal(this.form.controls.units.valueChanges, {
    initialValue: this.form.controls.units.value,
  });

  /** The inputs the current results were calculated from. */
  protected readonly submitted = signal<Inputs | null>(null);
  private readonly results = viewChild(Results, { read: ElementRef });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { weight, bodyFat, ...rest } = this.form.getRawValue();
    if (weight === null || bodyFat === null) return; // unreachable once valid; narrows the types
    this.submitted.set({ ...rest, weight, bodyFat });

    afterNextRender(() => this.results()?.nativeElement.scrollIntoView(), { injector: this.injector });
  }
}
