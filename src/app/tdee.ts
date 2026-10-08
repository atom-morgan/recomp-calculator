/**
 * Calorie and protein math. Pure functions only, so it is trivial to test.
 * BMR uses Katch-McArdle, which runs on lean mass: age and sex don't change it.
 */
export type Units = 'imperial' | 'metric';
export type Sex = 'male' | 'female';
export type GoalId = 'recomp' | 'fat' | 'muscle';

export interface Inputs {
  units: Units;
  sex: Sex;
  weight: number;
  bodyFat: number;
  stepIdx: number;
  hourIdx: number;
  senior: boolean;
}

export interface Target {
  id: GoalId;
  label: string;
  blurb: string;
  calories: number;
  protein: number;
}

export interface Result {
  tdee: number;
  bmr: number;
  targets: Target[];
}

export const STEP_OPTIONS = [
  { label: 'Under 4,000', factor: 1.2 },
  { label: '4,000 to 7,000', factor: 1.3 },
  { label: '7,000 to 10,000', factor: 1.4 },
  { label: '10,000+', factor: 1.5 },
] as const;

export const HOUR_OPTIONS = [
  { label: 'None', hours: 0 },
  { label: '1 to 2 hours', hours: 1.5 },
  { label: '3 to 4 hours', hours: 3.5 },
  { label: '5 to 6 hours', hours: 5.5 },
  { label: '7+ hours', hours: 8 },
] as const;

interface Goal {
  id: GoalId;
  label: string;
  blurb: string;
  /** Change vs maintenance, e.g. -0.1 is 10% under. */
  adjust: number;
  /** Gentler adjustment used for the 60+ group. */
  seniorAdjust: number;
  /** Protein in grams per kg of lean mass. */
  proteinPerKgLean: number;
}

const GOALS: readonly Goal[] = [
  {
    id: 'recomp', label: 'Standard recomp', adjust: -0.1, seniorAdjust: -0.1, proteinPerKgLean: 2.6,
    blurb: 'A small deficit with high protein and hard training. Fat comes down while muscle builds.',
  },
  {
    id: 'fat', label: 'Fat loss focus', adjust: -0.2, seniorAdjust: -0.15, proteinPerKgLean: 2.8,
    blurb: 'A bigger deficit. Faster scale and waist change, with protein high enough to protect muscle.',
  },
  {
    id: 'muscle', label: 'Muscle focus', adjust: 0.05, seniorAdjust: 0.05, proteinPerKgLean: 2.4,
    blurb: 'A slight surplus to push strength and size. Expect slower fat loss.',
  },
];

const LB_TO_KG = 0.45359237;
const KCAL_PER_TRAINING_HOUR = 300;
const SENIOR_PROTEIN_BONUS = 0.3;
const CALORIE_FLOOR: Record<Sex, number> = { male: 1500, female: 1200 };

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function calculate(input: Inputs): Result {
  const kg = input.units === 'imperial' ? input.weight * LB_TO_KG : input.weight;
  const leanKg = kg * (1 - input.bodyFat / 100);

  const bmr = 370 + 21.6 * leanKg;
  const tdee =
    bmr * STEP_OPTIONS[input.stepIdx].factor +
    (HOUR_OPTIONS[input.hourIdx].hours * KCAL_PER_TRAINING_HOUR) / 7;

  const targets = GOALS.map((goal): Target => {
    const adjust = input.senior ? goal.seniorAdjust : goal.adjust;
    const proteinPerKg = goal.proteinPerKgLean + (input.senior ? SENIOR_PROTEIN_BONUS : 0);
    return {
      id: goal.id,
      label: goal.label,
      blurb: goal.blurb,
      calories: Math.max(CALORIE_FLOOR[input.sex], roundTo(tdee * (1 + adjust), 10)),
      protein: roundTo(proteinPerKg * leanKg, 5),
    };
  });

  return { tdee: roundTo(tdee, 10), bmr: roundTo(bmr, 10), targets };
}
