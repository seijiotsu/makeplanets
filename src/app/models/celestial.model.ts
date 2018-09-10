export class Celestial {
  owner: string;
  system_id: string;

  _id: string;
  name: string;
  type: string;
  parent_id: string;

  SMA: number;
  eccentricity: number;
  inclination: number;
  ascendingNode: number;
  argOfPeriapsis: number;

  mass: number;
  radius: number;
  obliquity: number;

  sidereal: number; //If binary planet, use siderealAB, or siderealA and siderealB

  //For planets and moons only
  albedo: number;
  greenhouse: number;

  //Binary planets, using absolutely horrid OOP practices.
  binary: boolean;

  nameA: string;
  nameB: string;

  SMAAB: number;
  eccentricityAB: number;
  inclinationAB: number;
  ascendingNodeAB: number;
  argOfPeriapsisAB: number;

  massA: number;
  massB: number;
  radiusA: number;
  radiusB: number;

  mutualTidalLock: boolean;
  obliquityA: number; //If mutually tidally locked, use inclination
  obliquityB: number; //See above
  siderealA: number;
  siderealB: number;
  albedoA: number;
  albedoB: number;

  greenhouseA: number;
  greenhouseB: number;

  //TODO: replace with json deserializer
  constructor(id, name, type, parent, SMA, e, mass, radius, albedo, greenhouse) {
    this._id = id;
    this.name = name;
    this.type = type;
    this.parent_id = parent;
    this.SMA = SMA;
    this.eccentricity = e;
    this.mass = mass;
    this.radius = radius;
    this.albedo = albedo;
    this.greenhouse = greenhouse;
  }
}
