# Recomp calorie calculator

A one-page calculator for people who are "skinny fat". It estimates maintenance calories (TDEE) and
gives three targets: standard recomp, fat loss focus and muscle focus, each with a daily protein goal.

Built with Angular (standalone components, signals, reactive forms).

## Run it

```bash
npm install
npm start        # http://localhost:4200
npm test         # unit tests
npm run build    # production build in dist/
```

## How it works

- **BMR:** Katch-McArdle, `370 + 21.6 × lean mass (kg)`.
- **TDEE:** BMR × a step-count multiplier, plus about 300 kcal per training hour (spread over the week).
- **Targets:** recomp −10%, fat loss −20% (−15% for 60+), muscle focus +5%, with a calorie floor.
- **Protein:** 2.4 to 2.8 g per kg of lean mass depending on the goal, plus 0.3 for 60+.
- **Body fat:** picked on a slider with a 3 × 3 grid of reference photos, so people choose a picture
  instead of guessing a number.

These are estimates. The calculator tells users to track their results and adjust.

## Body fat photos

The picker expects one photo per card in `public/body-fat/`, named `<sex>-<range>.jpg`:

```
male-4-5.jpg    male-6-7.jpg    male-8-10.jpg   male-11-12.jpg  male-13-15.jpg
male-16-19.jpg  male-20-24.jpg  male-25-30.jpg  male-35-40.jpg

female-12-14.jpg  female-15-17.jpg  female-18-20.jpg  female-21-23.jpg  female-24-26.jpg
female-27-29.jpg  female-30-35.jpg  female-36-40.jpg  female-50-plus.jpg
```

Square crops around 600 × 600 px work best. The ranges live in `body-fat-stops.ts`.

## Structure

```
src/app/
  tdee.ts                  pure calculation logic (+ tdee.spec.ts)
  calculator/              container: reactive form, validation, submit
  results/                 presentational: numbers, goal tabs, call to action
  ui/
    segmented-control/     ControlValueAccessor built on native radios, optional info tip
    body-fat-picker/       ControlValueAccessor: slider + 3 x 3 photo grid (+ stops and tests)
    info-tip/              accessible "?" tooltip (hover, focus and tap)
  config.ts                call-to-action link
```
