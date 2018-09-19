import { Celestial } from "./celestial.model";

export class ResonanceBuilderLeader {
  celestial: Celestial;
  SMA: number;
  orbitPeriod: number;

  SMA_km: number;
  SMA_AU: number;

  orbitPeriod_d: number;
  orbitPeriod_y: number;
}

export class ResonanceBuilderFollower extends ResonanceBuilderLeader {
  ratio1: number;
  ratio2: number;
}
