// Katch-McArdle BMR (uses lean mass, so age and sex don't change the base number)
const LB_TO_KG = 0.45359237;
const KCAL_PER_TRAINING_HOUR = 300;

export type Units = 'imperial' | 'metric';
export type Sex = 'male' | 'female';

export interface Inputs {
  units: Units;
  sex: Sex;
  weight: number;
  bf: number;
  stepIdx: number;
  hourIdx: number;
  senior: boolean;
}

export interface Target {
  id: string;
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
];

export const HOUR_OPTIONS = [
  { label: 'None', hours: 0 },
  { label: '1 to 2 hours', hours: 1.5 },
  { label: '3 to 4 hours', hours: 3.5 },
  { label: '5 to 6 hours', hours: 5.5 },
  { label: '7+ hours', hours: 8 },
];

// adj = change vs TDEE; protein = g per kg of lean mass
const GOALS = [
  { id: 'recomp', label: 'Standard recomp', adj: -0.1, seniorAdj: -0.1, protein: 2.6,
    blurb: 'A small deficit with high protein and hard training. Fat comes down while muscle builds.' },
  { id: 'fat', label: 'Fat loss focus', adj: -0.2, seniorAdj: -0.15, protein: 2.8,
    blurb: 'A bigger deficit. Faster scale and waist change, with protein high enough to protect muscle.' },
  { id: 'muscle', label: 'Muscle focus', adj: 0.05, seniorAdj: 0.05, protein: 2.4,
    blurb: 'A slight surplus to push strength and size. Expect slower fat loss.' },
];

const round10 = (n: number) => Math.round(n / 10) * 10;

export function calculate(i: Inputs): Result {
  const kg = i.units === 'imperial' ? i.weight * LB_TO_KG : i.weight;
  const lbm = kg * (1 - i.bf / 100);
  const bmr = 370 + 21.6 * lbm;
  const tdee =
    bmr * STEP_OPTIONS[i.stepIdx].factor +
    (HOUR_OPTIONS[i.hourIdx].hours * KCAL_PER_TRAINING_HOUR) / 7;
  const floor = i.sex === 'female' ? 1200 : 1500;

  const targets = GOALS.map((g) => {
    const adj = i.senior ? g.seniorAdj : g.adj;
    const protein = (g.protein + (i.senior ? 0.3 : 0)) * lbm;
    return {
      id: g.id,
      label: g.label,
      blurb: g.blurb,
      calories: Math.max(floor, round10(tdee * (1 + adj))),
      protein: Math.round(protein / 5) * 5,
    };
  });
  return { tdee: round10(tdee), bmr: round10(bmr), targets };
}
