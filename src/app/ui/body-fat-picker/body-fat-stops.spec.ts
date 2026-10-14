import { BODY_FAT_RANGE, BODY_FAT_STOPS } from './body-fat-stops';

describe('BODY_FAT_STOPS', () => {
  for (const sex of ['male', 'female'] as const) {
    it(`${sex}: has nine unique stops that sit inside the slider range`, () => {
      const stops = BODY_FAT_STOPS[sex];
      const { min, max } = BODY_FAT_RANGE[sex];
      expect(stops.length).toBe(9);
      expect(new Set(stops.map((s) => s.id)).size).toBe(9);
      for (const s of stops) {
        expect(s.value).toBeGreaterThanOrEqual(Math.max(min, s.low));
        expect(s.value).toBeLessThanOrEqual(Math.min(max, s.high));
      }
    });
  }
});
