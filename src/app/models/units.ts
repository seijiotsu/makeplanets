export enum LengthUnits {
  meters = 1,
  kilometers = 1000,
  gigameters = 1000000000,
  AU = 149597870700
}

export enum MassUnits {
  kilograms = 1,
  moons = 0.07346 * Math.pow(10, 24),
  earths = 5.9722 * Math.pow(10, 24),
  jups = 1898.19 * Math.pow(10, 24),
  suns = 1.98855 * Math.pow(10, 30)
}

export enum RadiusUnits {
  m = 1.0 / 1000,
  km = 1,
  moons = 1737.4,
  earths = 6371.008,
  jups = 69911,
  suns = 695700
}

export enum DensityUnits {
  kgm3 = 1,
  gcm3 = 1000,
  earths = 5514
}

export enum GravityUnits {
  ms2 = 1,
  g = 9.80665
}

export enum TimeUnits {
  seconds = 1,
  minutes = 60,
  hours = minutes * 60,
  days = hours * 24,
  years = days * 365.2422
}

export enum TemperatureUnitTypes {
  fahrenheit = 1,
  celsius = 2,
  kelvin = 3
}

export enum LuminosityUnits {
  suns = 3.839 * Math.pow(10, 26),
  watts = 1
}
