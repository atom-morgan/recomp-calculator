import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CTA_URL } from '../config';
import { GoalId, Inputs, calculate } from '../tdee';

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
  protected readonly goal = signal<GoalId>('recomp');

  protected readonly result = computed(() => calculate(this.inputs()));
  protected readonly active = computed(
    () => this.result().targets.find((t) => t.id === this.goal()) ?? this.result().targets[0],
  );
}
