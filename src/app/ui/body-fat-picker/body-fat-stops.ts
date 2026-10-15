import { Sex } from '../../tdee';

export interface BodyFatStop {
  id: string; // used in the photo file name, e.g. male-20-24.png
  low: number;
  high: number;
  value: number; // what the slider jumps to when the card is tapped
  range: string;
  description: string;
}

export const BODY_FAT_RANGE: Record<Sex, { min: number; max: number }> = {
  male: { min: 4, max: 50 },
  female: { min: 12, max: 50 },
};

// Same ranges as the reference charts, gaps included.
export const BODY_FAT_STOPS: Record<Sex, BodyFatStop[]> = {
  male: [
    { id: '4-5', low: 4, high: 5, value: 5, range: '4 to 5%',
      description: 'Competition-stage leanness. Very hard to maintain.' },
    { id: '6-7', low: 6, high: 7, value: 7, range: '6 to 7%',
      description: 'Extremely lean, with sharp muscle separation.' },
    { id: '8-10', low: 8, high: 10, value: 9, range: '8 to 10%',
      description: 'Very lean. Abs and muscle separation are clearly visible.' },
    { id: '11-12', low: 11, high: 12, value: 12, range: '11 to 12%',
      description: 'Lean. Abs are visible with clear definition.' },
    { id: '13-15', low: 13, high: 15, value: 14, range: '13 to 15%',
      description: 'Fit. Abs are visible but softer.' },
    { id: '16-19', low: 16, high: 19, value: 18, range: '16 to 19%',
      description: 'Little ab definition and a soft waist.' },
    { id: '20-24', low: 20, high: 24, value: 22, range: '20 to 24%',
      description: 'Soft midsection. Abs are not visible.' },
    { id: '25-30', low: 25, high: 30, value: 28, range: '25 to 30%',
      description: 'Rounder waist and soft all over.' },
    { id: '35-40', low: 35, high: 40, value: 38, range: '35 to 40%',
      description: 'Significant fat around the waist and torso.' },
  ],
  female: [
    { id: '12-14', low: 12, high: 14, value: 13, range: '12 to 14%',
      description: 'Very lean, with clear ab and muscle definition.' },
    { id: '15-17', low: 15, high: 17, value: 16, range: '15 to 17%',
      description: 'Lean and athletic. Abs are visible.' },
    { id: '18-20', low: 18, high: 20, value: 19, range: '18 to 20%',
      description: 'Lean, with a toned look.' },
    { id: '21-23', low: 21, high: 23, value: 22, range: '21 to 23%',
      description: 'Fit, with a defined waist.' },
    { id: '24-26', low: 24, high: 26, value: 25, range: '24 to 26%',
      description: 'Soft curves and little muscle definition.' },
    { id: '27-29', low: 27, high: 29, value: 28, range: '27 to 29%',
      description: 'Softer all over, with a less defined waist.' },
    { id: '30-35', low: 30, high: 35, value: 33, range: '30 to 35%',
      description: 'A fuller midsection, hips and thighs.' },
    { id: '36-40', low: 36, high: 40, value: 38, range: '36 to 40%',
      description: 'Noticeably more fat around the midsection.' },
    { id: '50-plus', low: 50, high: 50, value: 50, range: '50% and up',
      description: 'Very high body fat, mostly around the midsection and hips.' },
  ],
};
