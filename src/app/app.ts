import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { HOUR_OPTIONS, Result, STEP_OPTIONS, Sex, Units, calculate } from './calc';

const CTA_URL = 'https://example.com/book-a-call'; // TODO: your booking link

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly ctaUrl = CTA_URL;
  readonly stepOptions = STEP_OPTIONS;
  readonly hourOptions = HOUR_OPTIONS;
  readonly unitOptions: { value: Units; label: string }[] = [
    { value: 'imperial', label: 'lb' },
    { value: 'metric', label: 'kg' },
  ];
  readonly sexOptions: { value: Sex; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];
  readonly ageOptions = [
    { value: false, label: 'Under 60' },
    { value: true, label: '60 or over' },
  ];

  units = signal<Units>('imperial');
  sex = signal<Sex>('male');
  weight = signal('');
  bf = signal('');
  stepIdx = signal(1);
  hourIdx = signal(2);
  senior = signal(false);

  result = signal<Result | null>(null);
  goal = signal('recomp');
  error = signal('');

  active = computed(() => this.result()?.targets.find((t) => t.id === this.goal()));
  resultsEl = viewChild<ElementRef<HTMLElement>>('results');

  fmt(n: number) {
    return n.toLocaleString();
  }

  text(e: Event) {
    return (e.target as HTMLInputElement).value;
  }

  submit(e: Event) {
    e.preventDefault();
    const weight = parseFloat(this.weight());
    const bf = parseFloat(this.bf());
    if (!(weight > 0)) return this.error.set('Enter your current weight.');
    if (!(bf >= 5 && bf <= 60))
      return this.error.set('Enter a body fat percentage between 5 and 60. A best guess is fine.');
    this.error.set('');
    this.result.set(
      calculate({
        units: this.units(), sex: this.sex(), weight, bf,
        stepIdx: this.stepIdx(), hourIdx: this.hourIdx(), senior: this.senior(),
      }),
    );
    setTimeout(() => this.resultsEl()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }
}
