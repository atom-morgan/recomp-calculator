import { TestBed } from '@angular/core/testing';
import { Inputs } from '../tdee';
import { Results } from './results';

const base: Inputs = {
  units: 'imperial', sex: 'male', weight: 175, bodyFat: 25, stepIdx: 1, hourIdx: 2, senior: false,
};

// the "% below maintenance" line for each goal tab, in tab order
function offsets(inputs: Inputs) {
  const fixture = TestBed.createComponent(Results);
  fixture.componentRef.setInput('inputs', inputs);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return [...el.querySelectorAll<HTMLButtonElement>('[role=tab]')].map((tab) => {
    tab.click();
    fixture.detectChanges();
    return el.querySelector('.offset')!.textContent!.trim();
  });
}

describe('Results', () => {
  it('shows how far each target is from maintenance', () => {
    expect(offsets(base)).toEqual([
      '10% below maintenance',
      '20% below maintenance',
      '5% above maintenance',
    ]);
  });

  it('uses the gentler fat loss deficit at 60 or over', () => {
    expect(offsets({ ...base, senior: true })[1]).toBe('15% below maintenance');
  });

  it('gives the real gap when a target is raised to the calorie floor', () => {
    // TDEE 1,290, so 1,200 is about 7% under rather than 10% or 20%
    const small: Inputs = { ...base, sex: 'female', weight: 90, bodyFat: 20, stepIdx: 0, hourIdx: 0 };
    expect(offsets(small)).toEqual([
      '7% below maintenance, at the 1,200 kcal daily minimum',
      '7% below maintenance, at the 1,200 kcal daily minimum',
      '5% above maintenance',
    ]);
  });

  it('says so when the floor is above maintenance', () => {
    // TDEE 1,150, so the 1,200 floor is a small surplus
    const tiny: Inputs = { ...base, sex: 'female', weight: 80, bodyFat: 25, stepIdx: 0, hourIdx: 0 };
    expect(offsets(tiny)[1]).toBe('4% above maintenance, at the 1,200 kcal daily minimum');
  });
});
