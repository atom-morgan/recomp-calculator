import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Calculator } from './calculator';

describe('Calculator', () => {
  let fixture: ComponentFixture<Calculator>;
  let el: HTMLElement;

  const weightInput = () => el.querySelector<HTMLInputElement>('input[type=number]')!;

  function typeWeight(value: string) {
    weightInput().value = value;
    weightInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  // the first segmented control is Units: lb, then kg
  function switchTo(units: 'lb' | 'kg') {
    const [lb, kg] = el.querySelectorAll<HTMLInputElement>('app-segmented-control input');
    (units === 'lb' ? lb : kg).click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Calculator);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('converts the weight when switching from lb to kg', () => {
    typeWeight('175');
    switchTo('kg');
    expect(weightInput().value).toBe('79.4');
  });

  it('converts kg to whole pounds', () => {
    switchTo('kg');
    typeWeight('80');
    switchTo('lb');
    expect(weightInput().value).toBe('176');
  });

  it('gives back exactly what was typed after switching back and forth', () => {
    typeWeight('80');
    switchTo('kg');
    switchTo('lb');
    switchTo('kg');
    switchTo('lb');
    expect(weightInput().value).toBe('80');
  });

  it('converts from a newly typed value after a switch', () => {
    typeWeight('175');
    switchTo('kg');
    typeWeight('70');
    switchTo('lb');
    expect(weightInput().value).toBe('154');
  });

  it('leaves an empty weight empty', () => {
    switchTo('kg');
    expect(weightInput().value).toBe('');
  });
});
