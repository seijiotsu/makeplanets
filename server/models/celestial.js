var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CelestialSchema = new mongoose.Schema({
  system_id: { type: String, default: '' },
  owner: { type: String, default: '' },

  name: { type: String, default: '' },
  type: { type: String, default: '' },
  parent_id: { type: String, default: '' },

  SMA: { type: Number, default: 0 },
  eccentricity: { type: Number, default: 0 },
  inclination: { type: Number, default: 0 },
  ascendingNode: { type: Number, default: 0 },
  argOfPeriapsis: { type: Number, default: 0 },

  mass: { type: Number, default: 0 },
  radius: { type: Number, default: 0 },
  obliquity: { type: Number, default: 0 },

  sidereal: { type: Number, default: 0 },
  tidalLock: { type: Number, default: 0 },

  //For planets and moons only
  albedo: { type: Number, default: 0 },
  greenhouse: { type: Number, default: 0 },

  rings: { type: Boolean, default: false },
  ringsInnerLimit: { type: Number, default: 0 },
  ringsOuterLimit: { type: Number, default: 0 },

  binary: { type: Boolean, default: false },

  nameA: { type: String },
  nameB: { type: String },

  SMAAB: { type: Number},
  eccentricityAB: { type: Number, default: 0 },
  inclinationAB: { type: Number, default: 0 },
  ascendingNodeAB: { type: Number, default: 0 },
  argOfPeriapsisAB: { type: Number, default: 0 },

  massA: { type: Number, default: 0 },
  radiusA: { type: Number, default: 0 },
  massB: { type: Number, default: 0 },
  radiusB: { type: Number, default: 0 },

  mutualTidalLock: { type: Boolean, default: false },

  obliquityA: { type: Number, default: 0 },
  obliquityB: { type: Number, default: 0 },

  siderealA: { type: Number, default: 0 },
  siderealB: { type: Number, default: 0 },

  albedoA: { type: Number, default: 0 },
  greenhouseA: { type: Number, default: 0 },
  albedoB: { type: Number, default: 0 },
  greenhouseB: { type: Number, default: 0 },

  ringsA: { type: Boolean, default: false },
  ringsAInnerLimit: { type: Number, default: 0 },
  ringsAOuterLimit: { type: Number, default: 0 },
  ringsB: { type: Boolean, default: false },
  ringsBInnerLimit: { type: Number, default: 0 },
  ringsBOuterLimit: { type: Number, default: 0 }
});

module.exports = mongoose.model('Celestial', CelestialSchema)
