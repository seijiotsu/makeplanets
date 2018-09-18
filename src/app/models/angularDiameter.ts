import { Celestial } from './celestial.model';

export class AngularDiameter {
  min_deg: number;
  avg_deg: number;
  max_deg: number;
  celestial: Celestial;

  binary: boolean; //In the case of binary, *_deg represents the size of planet A in the sky, and *_degB the size of planet B
  self: boolean; //In the case of self, *_deg represents the size of planet A in the sky of planet B, and *_degB vice versa

  min_degB: number;
  avg_degB: number;
  max_degB: number;
}
