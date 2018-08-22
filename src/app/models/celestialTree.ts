import { Celestial } from '../models/celestial.model';

export class CelestialTree {
  parent_id: string;
  celestial: Celestial;
  children: CelestialTree[];
}
