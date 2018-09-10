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

  //For planets and moons only
  albedo: { type: Number, default: 0 },
  greenhouse: { type: Number, default: 0 },

  binary: { type: Boolean, default: false },

  nameA: { type: String },
  nameB: { type: String },

  SMAAB: { type: Number},
  eccentricityAB: { type: Number },
  inclinationAB: { type: Number },
  ascendingNodeAB: { type: Number },
  argOfPeriapsisAB: { type: Number },

  massA: { type: Number },
  radiusA: { type: Number },
  massB: { type: Number },
  radiusB: { type: Number },

  mutualTidalLock: { type: Boolean },

  obliquityA: { type: Number },
  obliquityB: { type: Number },

  siderealA: { type: Number },
  siderealB: { type: Number },

  albedoA: { type: Number },
  greenhouseA: { type: Number },
  albedoB: { type: Number },
  greenhouseB: { type: Number }
});

module.exports = mongoose.model('Celestial', CelestialSchema)
