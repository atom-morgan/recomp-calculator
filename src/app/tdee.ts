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
  floored: boolean; // raised to the calorie floor
}

// kcal per day; the three parts add up to the rounded TDEE
export interface Breakdown {
  bmr: number;
  movement: number;
  training: number;
}

export interface Result {
  tdee: number;
  breakdown: Breakdown;
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

// adjust is the change from maintenance (-0.1 means 10% under).
// protein is grams per kg of lean mass.
export interface Goal {
  id: GoalId;
  label: string;
  blurb: string;
  adjust: number;
  seniorAdjust: number;
  protein: number;
}

export const GOALS: readonly Goal[] = [
  {
    id: 'recomp', label: 'Standard recomp', adjust: -0.1, seniorAdjust: -0.1, protein: 2.6,
    blurb: 'A small deficit with high protein and hard training. Fat comes down while muscle builds.',
  },
  {
    id: 'fat', label: 'Fat loss focus', adjust: -0.2, seniorAdjust: -0.15, protein: 2.8,
    blurb: 'A bigger deficit. Faster scale and waist change, with protein high enough to protect muscle.',
  },
  {
    id: 'muscle', label: 'Muscle focus', adjust: 0.05, seniorAdjust: 0.05, protein: 2.4,
    blurb: 'A slight surplus to push strength and size. Expect slower fat loss.',
  },
];

export const LB_TO_KG = 0.45359237;
const KCAL_PER_TRAINING_HOUR = 300;
const SENIOR_PROTEIN_BONUS = 0.3;
export const CALORIE_FLOOR: Record<Sex, number> = { male: 1500, female: 1200 };

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

// Round each part to 10 kcal, then give any leftover to the largest part
// so the bar always adds up to the TDEE we show.
function splitTdee(tdee: number, parts: Breakdown): Breakdown {
  const rounded = {
    bmr: roundTo(parts.bmr, 10),
    movement: roundTo(parts.movement, 10),
    training: roundTo(parts.training, 10),
  };
  const keys = Object.keys(rounded) as (keyof Breakdown)[];
  const largest = keys.reduce((a, b) => (rounded[b] > rounded[a] ? b : a));
  rounded[largest] += tdee - keys.reduce((sum, k) => sum + rounded[k], 0);
  return rounded;
}

export function calculate(input: Inputs): Result {
  const kg = input.units === 'imperial' ? input.weight * LB_TO_KG : input.weight;
  const leanKg = kg * (1 - input.bodyFat / 100);

  // Katch-McArdle, so only lean mass matters
  const bmr = 370 + 21.6 * leanKg;
  const movement = bmr * (STEP_OPTIONS[input.stepIdx].factor - 1);
  const training = (HOUR_OPTIONS[input.hourIdx].hours * KCAL_PER_TRAINING_HOUR) / 7;
  const tdee = bmr + movement + training;
  const shownTdee = roundTo(tdee, 10);

  const targets = GOALS.map((goal): Target => {
    const adjust = input.senior ? goal.seniorAdjust : goal.adjust;
    const protein = (goal.protein + (input.senior ? SENIOR_PROTEIN_BONUS : 0)) * leanKg;
    const calories = roundTo(tdee * (1 + adjust), 10);
    const floor = CALORIE_FLOOR[input.sex];
    return {
      id: goal.id,
      label: goal.label,
      blurb: goal.blurb,
      calories: Math.max(floor, calories),
      protein: roundTo(protein, 5),
      floored: calories < floor,
    };
  });

  return {
    tdee: shownTdee,
    breakdown: splitTdee(shownTdee, { bmr, movement, training }),
    targets,
  };
}
