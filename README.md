# Recomp calculator

A calorie calculator for people who are skinny fat. You enter your weight, body fat, activity and age,
and it gives you maintenance calories plus three targets (standard recomp, fat loss, muscle focus),
each with a daily protein goal.

Built with Angular: standalone components, signals and reactive forms.

## Running it

```bash
npm install
npm start      # http://localhost:4200
npm test
npm run build
```

## The math

- BMR uses Katch-McArdle: `370 + 21.6 × lean mass (kg)`
- TDEE is BMR times a step multiplier, plus about 300 kcal per training hour
- Recomp is 10% under maintenance, fat loss 20% under (15% for 60+), muscle focus 5% over,
  with a calorie floor of 1,500 (men) and 1,200 (women)
- Protein is 2.4 to 2.8 g per kg of lean mass, plus 0.3 for 60+
