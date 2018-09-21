import { Celestial } from '../models/celestial.model';

export class CelestialTree {
  parent_id: string; //Testing github
  celestial: Celestial;
  children: CelestialTree[];
}
