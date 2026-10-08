import { Inputs, calculate } from './tdee';

const base: Inputs = {
  units: 'imperial', sex: 'male', weight: 175, bodyFat: 25, stepIdx: 1, hourIdx: 2, senior: false,
};

const target = (inputs: Inputs, id: string) => calculate(inputs).targets.find((t) => t.id === id)!;

describe('calculate', () => {
  it('estimates maintenance calories from lean mass, steps and training', () => {
    expect(calculate(base).tdee).toBe(2300);
  });

  it('returns recomp, fat loss and muscle targets with protein', () => {
    const { targets } = calculate(base);
    expect(targets.map((t) => t.calories)).toEqual([2070, 1840, 2420]);
    expect(targets.map((t) => t.protein)).toEqual([155, 165, 145]);
  });

  it('gives the same answer in metric', () => {
    expect(calculate({ ...base, units: 'metric', weight: 79.38 }).tdee).toBe(2300);
  });

  it('uses a gentler deficit and more protein at 60 or over', () => {
    const fat = target({ ...base, senior: true }, 'fat');
    expect(fat.calories).toBe(1960);
    expect(fat.protein).toBe(185);
  });

  it('never goes below the calorie floor', () => {
    const small: Inputs = { ...base, sex: 'female', weight: 90, bodyFat: 20, stepIdx: 0, hourIdx: 0 };
    expect(target(small, 'fat').calories).toBe(1200);
  });
});
