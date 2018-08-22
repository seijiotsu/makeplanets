export class StabilityObject {
  ratio: number;
  stability: Stability;
  class: string;
}

export class CelestialStabilityWrapperObject {
  _id: string; //ID of the parent object
  stability: Stability;
  class: string;
  stabilities: StabilityObject[];
}

export enum Stability {
  Stable = "Stable",
  PotentiallyUnstable = "Potentially Unstable",
  Unstable = "Unstable"
}
