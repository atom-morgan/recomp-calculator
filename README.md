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

These are estimates. The calculator tells users to track their results and adjust.

## Structure

```
src/app/
  tdee.ts                  pure calculation logic (+ tdee.spec.ts)
  calculator/              container: reactive form, validation, submit
  results/                 presentational: numbers, goal tabs, call to action
  ui/segmented-control/    reusable ControlValueAccessor built on native radios
  config.ts                call-to-action link
```
