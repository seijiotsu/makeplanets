export class StabilityObject {
  ratio: number;
  stability: Stability;
  class: string;
  hillSphere: HillSphere;
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
  Unstable = "Unstable",
}

export enum HillSphere {
  Stable = "Object is within 1/3rd of parent's Hill sphere",
  PotentiallyUnstable = "Object further than 1/3rd of parent's Hill sphere, though still within it. Orbit unlikely to remain stable over long time scales.",
  Unstable = "Object outside of parent's Hill sphere"
}
