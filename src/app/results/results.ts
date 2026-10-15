import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CTA_URL, INSTAGRAM_HANDLE } from '../config';
import { CALORIE_FLOOR, GOALS, GoalId, Inputs, calculate } from '../tdee';

// -0.1 -> 10
const pct = (adjust: number) => Math.round(Math.abs(adjust) * 100);
const goal = (id: GoalId) => GOALS.find((g) => g.id === id)!;

@Component({
  selector: 'app-results',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  readonly inputs = input.required<Inputs>();

  protected readonly ctaUrl = CTA_URL;
  protected readonly instagramHandle = INSTAGRAM_HANDLE;
  protected readonly instagramUrl = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;
  protected readonly goal = signal<GoalId>('recomp');

  protected readonly result = computed(() => calculate(this.inputs()));
  protected readonly active = computed(
    () => this.result().targets.find((t) => t.id === this.goal()) ?? this.result().targets[0],
  );
  protected readonly offset = computed(() => {
    const { adjust } = this.active();
    return `${pct(adjust)}% ${adjust < 0 ? 'below' : 'above'} maintenance`;
  });

  protected readonly parts = computed(() => {
    const { bmr, movement, training } = this.result().breakdown;
    return [
      { id: 'bmr', label: 'Resting burn', kcal: bmr },
      { id: 'movement', label: 'Daily movement', kcal: movement },
      { id: 'training', label: 'Training', kcal: training },
    ];
  });

  // copy for "How your targets are set", pulled from the same constants as the math
  protected readonly floor = CALORIE_FLOOR;
  protected readonly recompPct = pct(goal('recomp').adjust);
  protected readonly fatPct = pct(goal('fat').adjust);
  protected readonly fatSeniorNote =
    goal('fat').seniorAdjust === goal('fat').adjust
      ? ''
      : ` (${pct(goal('fat').seniorAdjust)}% if you're 60 or over)`;
  protected readonly musclePct = pct(goal('muscle').adjust);
}
