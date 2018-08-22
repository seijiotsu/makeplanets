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

  sidereal: number;

  //For planets and moons only
  albedo: number;
  greenhouse: number;

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
