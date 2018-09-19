import { Celestial } from "./celestial.model";

export class ResonanceBuilderLeader {
  celestial: Celestial;
  SMA: number;
  orbitPeriod: number;
}

export class ResonanceBuilderFollower extends ResonanceBuilderLeader {
  ratio1: number;
  ratio2: number;
}
