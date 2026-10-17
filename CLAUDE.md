# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page Angular 22 calorie calculator for "skinny fat" people. The user enters weight, body fat,
activity and age. The app shows maintenance calories (TDEE) and three targets (recomp, fat loss,
muscle focus), each with a daily protein goal. There's no backend, router or services.

## Commands

```bash
npm start                                   # dev server at http://localhost:4200
npm run build                               # production build to dist/recomp-calculator
npm test                                    # Vitest via @angular/build:unit-test (watches in a TTY)
npx ng test --watch=false                   # run once
npx ng test --watch=false --include src/app/tdee.spec.ts   # one spec file
npx ng test --watch=false --filter '^calculate'            # by suite/test name regex
npx prettier --write src                    # formatting (printWidth 100, single quotes, angular parser for .html)
```

There's no lint script. Production budgets in `angular.json` warn at 4 kB and fail at 8 kB for any
single component stylesheet, so keep component CSS small.

## Architecture

- **`src/app/tdee.ts` is where all the math lives.** It's a pure `calculate(Inputs): Result` with no
  Angular imports. It also exports `STEP_OPTIONS` and `HOUR_OPTIONS`, which the form renders. The form
  stores *indexes* into those arrays (`stepIdx` and `hourIdx`), not the values themselves. Goal
  percentages, the 60+ adjustments, protein-per-kg values, calorie floors and rounding are all
  constants in this file. `tdee.spec.ts` pins exact numbers, so any change to the formula means
  updating those expectations on purpose. `Result` also carries a `breakdown` (resting burn, daily
  movement, training), rounded so the parts add up to the displayed `tdee`, and each `Target` has a
  `floored` flag for when the calorie floor raised it.
- **Results copy is generated from the math.** `GOALS` and `CALORIE_FLOOR` are exported so
  `Results` can build the "How your targets are set" percentages and floors from them. The
  "% below maintenance" line on each tab is worked out from the displayed calories and TDEE, not
  the goal's percentage, so it stays true at the floor. Don't hard-code these numbers in templates.
- **Data flow:** `Calculator` owns a typed `NonNullableFormBuilder` reactive form. On submit it
  copies the raw value into a `submitted` signal of type `Inputs`. `Results` takes that as a required
  signal input and calls `calculate()` inside a `computed`. Results only update on submit, not while
  the user is typing.
- **Sex-dependent body fat:** `ui/body-fat-picker/body-fat-stops.ts` defines the allowed range
  (`BODY_FAT_RANGE`) and reference stops for each sex. `Calculator` clamps `bodyFat` into the new range
  whenever sex changes. `BodyFatPicker` is a `ControlValueAccessor`. Each stop's `id` maps to a photo
  at `public/body-fat/{sex}-{id}.png`, so adding or renaming a stop also means adding or renaming
  that image.
- **`ui/`** holds small reusable form controls (`SegmentedControl`, `InfoTip`, `BodyFatPicker`).
- **`src/app/config.ts`** holds the site's external settings: the coaching CTA link (`CTA_URL`),
  `INSTAGRAM_HANDLE` (the handle only; the URL is built in `Results`) and `GA_MEASUREMENT_ID`.
- **Analytics:** `src/app/analytics.ts` loads GA4 from `main.ts` and exports `track(event, params)`.
  It's a no-op when `GA_MEASUREMENT_ID` is empty or on localhost, so local testing isn't counted.
  Current events: `calculate`, `select_goal`, `apply_click` (a GA key event) and `instagram_click`.
  Keep event names stable, since GA reports and the key event depend on them. Never send form
  inputs (weight, body fat, sex, age) to GA.

## Deployment

The live site is https://skinnyfatcalculator.com, hosted on Netlify. Every push to `main` on
GitHub (`origin`) triggers a production deploy, so treat pushing as releasing. Build settings are in
`netlify.toml` (publish dir `dist/recomp-calculator/browser`, Node 24). DNS is managed by Netlify.
Files in `public/` are served at the site root under their own names, without content hashes.
`.claude/launch.json` defines the `dev` server for the Claude app's browser preview.

## Conventions

The code uses standalone components (there are no NgModules) and `ChangeDetectionStrategy.OnPush`.
It prefers signals (`signal`, `computed`, `input`, `viewChild`, `toSignal`) over RxJS state, and
uses `inject()` instead of constructor injection. Component files are named without the
`.component` suffix (`calculator.ts`, class `Calculator`). Weights can be entered in lb or kg and
are converted to kg inside `calculate()`.
