import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { track } from '../analytics';
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
  // Worked out from the numbers on screen rather than the goal's percentage,
  // so it stays true when the calorie floor lifts the target.
  protected readonly offset = computed(() => {
    const { calories, floored } = this.active();
    const change = calories / this.result().tdee - 1;
    const where =
      pct(change) === 0
        ? 'At maintenance'
        : `${pct(change)}% ${change < 0 ? 'below' : 'above'} maintenance`;
    if (!floored) return where;
    const floor = CALORIE_FLOOR[this.inputs().sex].toLocaleString('en-US');
    return `${where}, at the ${floor} kcal daily minimum`;
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

  protected selectGoal(id: GoalId) {
    this.goal.set(id);
    track('select_goal', { goal: id });
  }

  protected trackApply() {
    track('apply_click', { goal: this.active().id });
  }

  protected trackInstagram() {
    track('instagram_click');
  }
}
