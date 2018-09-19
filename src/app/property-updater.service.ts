import { Injectable } from '@angular/core';
import { DerivedCelestialProperties } from './models/derivedCelestialProperties';
import { CelestialStabilityWrapperObject, Stability, StabilityObject } from './models/stabilities';
import { Celestial } from './models/celestial.model';
import { UnitConverterService } from './unit-converter.service';
import {
  LengthUnits,
  MassUnits,
  RadiusUnits,
  DensityUnits,
  GravityUnits,
  TimeUnits,
  TemperatureUnitTypes,
  LuminosityUnits
} from './models/units';
import { Constants } from './models/constants';
import * as math from 'mathjs'
import { AngularDiameter } from './models/angularDiameter';
import { Relations } from './models/relations';
import { DEFAULT_BUTTON_TYPES } from '@clr/angular';


const DEFAULT_PRECISION = 5;
const LOW_PRECISION = 2;
const INT_PRECISION = 0;

@Injectable({
  providedIn: 'root'
})
export class PropertyUpdaterService {

  constructor(
    private unitConverter: UnitConverterService
  ) { }

  findMinSiblingDistance(A: Celestial, B: Celestial): number {
    var SMA_m1 = this.unitConverter.convert(A.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var SMA_m2 = this.unitConverter.convert(B.SMA, LengthUnits.gigameters, LengthUnits.meters);

    var d1 = Math.abs(SMA_m1 * (1 - A.eccentricity) - SMA_m2 * (1 - B.eccentricity));
    var d2 = Math.abs(SMA_m1 * (1 + A.eccentricity) - SMA_m2 * (1 - B.eccentricity));
    var d3 = Math.abs(SMA_m1 * (1 - A.eccentricity) - SMA_m2 * (1 + B.eccentricity));
    var d4 = Math.abs(SMA_m1 * (1 + A.eccentricity) - SMA_m2 * (1 + B.eccentricity));
    var d5 = Math.abs(SMA_m1 - SMA_m2);

    var min_dist = Math.min(d1, d2);
    min_dist = Math.min(min_dist, d3);
    min_dist = Math.min(min_dist, d4);
    min_dist = Math.min(min_dist, d5);

    return min_dist;
  }

  findMaxSiblingDistance(A: Celestial, B: Celestial): number {
    var SMA_m1 = this.unitConverter.convert(A.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var SMA_m2 = this.unitConverter.convert(B.SMA, LengthUnits.gigameters, LengthUnits.meters);

    var d1 = Math.abs(SMA_m1 * (1 + A.eccentricity) + SMA_m2 * (1 + B.eccentricity));
    var d2 = Math.abs(SMA_m1 * (1 - A.eccentricity) + SMA_m2 * (1 + B.eccentricity));
    var d3 = Math.abs(SMA_m1 * (1 + A.eccentricity) + SMA_m2 * (1 - B.eccentricity));
    var d4 = Math.abs(SMA_m1 * (1 - A.eccentricity) + SMA_m2 * (1 - B.eccentricity));
    var d5 = Math.abs(SMA_m1 + SMA_m2);

    var max_dist = Math.max(d1, d2);
    max_dist = Math.max(max_dist, d3);
    max_dist = Math.max(max_dist, d4);
    max_dist = Math.max(max_dist, d5);

    return max_dist;

  }

  findAverageSiblingDistance(A: Celestial, B: Celestial): number {
    var SMA_m1 = this.unitConverter.convert(A.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var SMA_m2 = this.unitConverter.convert(B.SMA, LengthUnits.gigameters, LengthUnits.meters);

    var d5 = Math.abs(SMA_m1 - SMA_m2);


    return d5; //LOL I HAVE NO IDEA WHAT I'M DOING

  }

  angularDiameterSelf(celestial: Celestial): AngularDiameter {
    //For binary planets: lets them see themselves in the mirror. I.e. "Planet A from B, and planet B from A"

    var ad = new AngularDiameter();

    var cel_SMAAB = this.unitConverter.convert(celestial.SMAAB, LengthUnits.gigameters, LengthUnits.meters);
    var A_r = this.unitConverter.convert(celestial.radiusA, RadiusUnits.km, RadiusUnits.m);
    var B_r = this.unitConverter.convert(celestial.radiusB, RadiusUnits.km, RadiusUnits.m);

    var e = celestial.eccentricityAB || 0;

    //Sizes of planet A in the sky of planet B
    var d_min = cel_SMAAB * (1 - e) - B_r;
    var d_avg = cel_SMAAB - B_r;
    var d_max = cel_SMAAB * (1 + e) - B_r;

    var d_minB = cel_SMAAB * (1 - e) - A_r;
    var d_avgB = cel_SMAAB - A_r;
    var d_maxB = cel_SMAAB * (1 + e) - A_r;

    ad.min_deg = Math.atan((2 * A_r) / d_min) * 180 / Math.PI;
    ad.avg_deg = Math.atan((2 * A_r) / d_avg) * 180 / Math.PI;
    ad.max_deg = Math.atan((2 * A_r) / d_max) * 180 / Math.PI;

    ad.min_degB = Math.atan((2 * B_r) / d_minB) * 180 / Math.PI;
    ad.avg_degB = Math.atan((2 * B_r) / d_avgB) * 180 / Math.PI;
    ad.max_degB = Math.atan((2 * B_r) / d_maxB) * 180 / Math.PI;

    ad.binary = false;
    ad.self = true;
    ad.celestial = celestial;

    return ad;
  }

  angularDiameter(celestial: Celestial, relative: Celestial, parent: Celestial, relation: Relations, parentDerivedProperties: DerivedCelestialProperties): AngularDiameter {

    var ad = new AngularDiameter();

    var d_min, d_avg, d_max: number;

    var cel_SMA = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var rel_SMA = this.unitConverter.convert(relative.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var par_SMA;

    var cel_r = this.unitConverter.convert(celestial.radius, RadiusUnits.km, RadiusUnits.m);
    var rel_r = this.unitConverter.convert(relative.radius, RadiusUnits.km, RadiusUnits.m);
    var par_r;

    var cel_e = celestial.eccentricity;
    var rel_e = relative.eccentricity;
    var par_e;

    var rel_SMAAB, rel_rB, rel_eAB: number;
    if (relative.binary) {
      rel_SMAAB = this.unitConverter.convert(relative.SMAAB, LengthUnits.gigameters, LengthUnits.meters);
      rel_r = this.unitConverter.convert(relative.radiusA, RadiusUnits.km, RadiusUnits.m);
      rel_rB = this.unitConverter.convert(relative.radiusB, RadiusUnits.km, RadiusUnits.m);
      rel_eAB = relative.eccentricityAB;
    }

    //If the celestial we're trying to see the angular diameter of is the grandparent or parent sibling of
    //the reference celestial. Binary planets can be parent siblings, so we need to take this into account for those.
    if (relation == Relations.GRANDPARENT || relation == Relations.PARENT_SIBLING) {
      par_SMA = this.unitConverter.convert(parent.SMA, LengthUnits.gigameters, LengthUnits.meters);
      par_r = this.unitConverter.convert(parent.radius, RadiusUnits.km, RadiusUnits.m);
      par_e = parent.eccentricity;
    }


    //This only applies to binary planets if we're looking from the reference point of the star which, though possible,
    //is quite strange.
    if (relation == Relations.CHILD) {
      d_min = rel_SMA * (1 - rel_e) - cel_r;
      d_avg = rel_SMA - cel_r;
      d_max = rel_SMA * (1 + rel_e) - cel_r;
    }

    //This does not apply to binary planets.
    if (relation == Relations.GRANDPARENT) {
      d_min = par_SMA * (1 - par_e) - cel_SMA * (1 + cel_e) - cel_r;
      d_avg = par_SMA - cel_r;
      d_max = par_SMA * (1 + par_e) + cel_SMA * (1 + cel_e) - cel_r;
    }

    //This applies if we're looking from the moon of a binary planet.
    //We should calculate different d_mins and d_maxes because the SMAA and SMAB
    //of the binary planets is not neglegible.
    var d_minB, d_avgB, d_maxB;
    if (relation == Relations.PARENT) {
      d_min = cel_SMA * (1 - cel_e) - cel_r;
      d_avg = cel_SMA - cel_r;
      d_max = cel_SMA * (1 + cel_e) - cel_r;

      if (relative.binary) {
        d_min = cel_SMA * (1 - cel_e) - cel_r - parentDerivedProperties.SMAA_meters * (1 + rel_eAB);
        d_avg = Math.sqrt(parentDerivedProperties.SMAA_meters * parentDerivedProperties.SMAA_meters + cel_SMA * cel_SMA) - cel_r;
        d_max = cel_SMA * (1 + cel_e) - cel_r + parentDerivedProperties.SMAA_meters * (1 + rel_eAB);

        d_minB = cel_SMA * (1 - cel_e) - cel_r - parentDerivedProperties.SMAB_meters * (1 + rel_eAB);
        d_avgB = Math.sqrt(parentDerivedProperties.SMAB_meters * parentDerivedProperties.SMAB_meters + cel_SMA * cel_SMA) - cel_r;
        d_maxB = cel_SMA * (1 + cel_e) - cel_r + parentDerivedProperties.SMAB_meters * (1 + rel_eAB);
      }
    }

    //This applies if we're looking from the moon of a planet that is not the binary planet.
    if (relation == Relations.PARENT_SIBLING) {
      d_min = this.findMinSiblingDistance(parent, relative) - cel_SMA * (1 + cel_e) - cel_r;
      d_avg = this.findAverageSiblingDistance(parent, relative) - cel_r;
      d_max = this.findMaxSiblingDistance(parent, relative) + cel_SMA * (1 + cel_e) - cel_r;
    }

    //This applies if we're looking from a planet that is not the binary planet.
    //We could add the binary planet's SMAAB into this calculation but I'm lazy and honestly
    //nobody should really care.
    if (relation == Relations.SIBLING) {
      d_min = this.findMinSiblingDistance(celestial, relative) - cel_r;
      d_avg = this.findAverageSiblingDistance(celestial, relative) - cel_r;
      d_max = this.findMaxSiblingDistance(celestial, relative) - cel_r;
    }
    if (relation == Relations.PARENT && relative.binary) {
      ad.min_deg = Math.atan((2 * rel_r) / d_min) * 180 / Math.PI;
      ad.avg_deg = Math.atan((2 * rel_r) / d_avg) * 180 / Math.PI;
      ad.max_deg = Math.atan((2 * rel_r) / d_max) * 180 / Math.PI;
      ad.min_degB = Math.atan((2 * rel_r) / d_minB) * 180 / Math.PI;
      ad.avg_degB = Math.atan((2 * rel_r) / d_avgB) * 180 / Math.PI;
      ad.max_degB = Math.atan((2 * rel_r) / d_maxB) * 180 / Math.PI;
      ad.binary = relative.binary;
      ad.celestial = relative;
    } else {
      ad.min_deg = Math.atan((2 * rel_r) / d_min) * 180 / Math.PI;
      ad.avg_deg = Math.atan((2 * rel_r) / d_avg) * 180 / Math.PI;
      ad.max_deg = Math.atan((2 * rel_r) / d_max) * 180 / Math.PI; //max [distance] degrees
      ad.celestial = relative;

      ad.binary = relative.binary;
      if (relative.binary) {
        ad.min_degB = Math.atan((2 * rel_rB) / d_min) * 180 / Math.PI;
        ad.avg_degB = Math.atan((2 * rel_rB) / d_avg) * 180 / Math.PI;
        ad.max_degB = Math.atan((2 * rel_rB) / d_max) * 180 / Math.PI;
      }
    }
    
    return ad;
  }

  apoapsisPeriapsis(celestial: Celestial, P: DerivedCelestialProperties): void {
    var apoapsis = celestial.SMA * (1 + celestial.eccentricity);
    var periapsis = celestial.SMA * (1 - celestial.eccentricity);

    var apoapsis_km = this.unitConverter.convert(apoapsis, LengthUnits.gigameters, LengthUnits.kilometers);
    var apoapsis_AU = this.unitConverter.convert(apoapsis, LengthUnits.gigameters, LengthUnits.AU);

    var periapsis_km = this.unitConverter.convert(periapsis, LengthUnits.gigameters, LengthUnits.kilometers);
    var periapsis_AU = this.unitConverter.convert(periapsis, LengthUnits.gigameters, LengthUnits.AU);

    P.apoapsis_kilometers = math.round(apoapsis_km, INT_PRECISION);
    P.apoapsis_gigameters = math.round(apoapsis, DEFAULT_PRECISION);
    P.apoapsis_AU = math.round(apoapsis_AU, DEFAULT_PRECISION);
    P.periapsis_kilometers = math.round(periapsis_km, INT_PRECISION);
    P.periapsis_gigameters = math.round(periapsis, DEFAULT_PRECISION);
    P.periapsis_AU = math.round(periapsis_AU, DEFAULT_PRECISION);
  }

  apoapsisABperiapsisAB(celestial: Celestial, P: DerivedCelestialProperties): void {
    var apoapsis = celestial.SMAAB * (1 + celestial.eccentricityAB);
    var periapsis = celestial.SMAAB * (1 - celestial.eccentricityAB);
    var apoapsis_km = this.unitConverter.convert(apoapsis, LengthUnits.gigameters, LengthUnits.kilometers);
    var apoapsis_AU = this.unitConverter.convert(apoapsis, LengthUnits.gigameters, LengthUnits.AU);
    var periapsis_km = this.unitConverter.convert(periapsis, LengthUnits.gigameters, LengthUnits.kilometers);
    var periapsis_AU = this.unitConverter.convert(periapsis, LengthUnits.gigameters, LengthUnits.AU);
    P.apoapsisAB_kilometers = math.round(apoapsis_km, INT_PRECISION);
    P.apoapsisAB_gigameters = math.round(apoapsis, DEFAULT_PRECISION);
    P.apoapsisAB_AU = math.round(apoapsis_AU, DEFAULT_PRECISION);
    P.periapsisAB_kilometers = math.round(periapsis_km, INT_PRECISION);
    P.periapsisAB_gigameters = math.round(apoapsis, DEFAULT_PRECISION);
    P.periapsisAB_AU = math.round(periapsis_AU, DEFAULT_PRECISION);
  }

  stabilityTable(celestial: Celestial, siblings: Celestial[], parent: Celestial, P: DerivedCelestialProperties,
    ST: StabilityObject[][], index): void {
    //See:
    //https://worldbuilding.stackexchange.com/questions/37310/is-this-moon-system-stable/37318#37318

    var mass_kg = this.unitConverter.convert(parent.mass, MassUnits.earths, MassUnits.kilograms);

    var SMA_m1 = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var mass_kg1 = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);

    var parentCelestialForce = Constants.G * mass_kg * mass_kg1 / Math.pow(SMA_m1, 2);

    var isStable = true;
    var isUnstable = false;

    var i1 = index[celestial._id];

    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i]._id == celestial._id) continue;

      var i2 = index[siblings[i]._id];

      var SMA_m2 = this.unitConverter.convert(siblings[i].SMA, LengthUnits.gigameters, LengthUnits.meters);
      var mass_kg2 = this.unitConverter.convert(siblings[i].mass, MassUnits.earths, MassUnits.kilograms);

      var min_dist = this.findMinSiblingDistance(celestial, siblings[i]);

      var celestialSatelliteForce = Constants.G * mass_kg2 * mass_kg1 / Math.pow(min_dist, 2);
      var ratio = parentCelestialForce / celestialSatelliteForce;

      //Prettify the ratio and only show actually useful data.
      if (ratio > 1) {
        ratio = math.round(ratio, INT_PRECISION);
      } else {
        ratio = math.round(ratio, LOW_PRECISION);
      }

      var stability = new StabilityObject();
      stability.ratio = ratio;

      //Determine the ratio 'class'
      if (ratio > 2000) {
        stability.class = "mkp-stability-stable";
        stability.stability = Stability.Stable;
      } else if (ratio > 100) {
        stability.class = "mkp-stability-likely-unstable";
        stability.stability = Stability.PotentiallyUnstable;
        isStable = false;
      } else {
        stability.class = "mkp-stability-unstable";
        stability.stability = Stability.Unstable;
        isUnstable = true;
      }

      ST[i1][i2] = stability;
    }

    var S = new StabilityObject();

    if (isUnstable) {
      S.stability = Stability.Unstable;
      S.class = "mkp-stability-unstable";
    } else if (!isStable) {
      S.stability = Stability.PotentiallyUnstable;
      S.class = "mkp-stability-likely-unstable";
    } else {
      S.class = "mkp-stability-stable";
      S.stability = Stability.Stable;
    }

    ST[i1][i1] = S;
  }

  density(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radius, RadiusUnits.km, RadiusUnits.m);
    var density = mass_kg / (4 / 3.0 * Math.PI * Math.pow(radius_m, 3));

    var density_gmc3 = this.unitConverter.convert(density, DensityUnits.kgm3, DensityUnits.gcm3);
    var density_earths = this.unitConverter.convert(density, DensityUnits.kgm3, DensityUnits.earths);

    P.density_kgm3 = math.round(density, LOW_PRECISION);
    P.density_gcm3 = math.round(density_gmc3, DEFAULT_PRECISION);
    P.density_earth = math.round(density_earths, DEFAULT_PRECISION);

  }

  //Binary
  densityA(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.massA, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radiusA, RadiusUnits.km, RadiusUnits.m);
    var density = mass_kg / (4 / 3.0 * Math.PI * Math.pow(radius_m, 3));

    var density_gmc3 = this.unitConverter.convert(density, DensityUnits.kgm3, DensityUnits.gcm3);
    var density_earths = this.unitConverter.convert(density, DensityUnits.kgm3, DensityUnits.earths);

    P.densityA_kgm3 = math.round(density, LOW_PRECISION);
    P.densityA_gcm3 = math.round(density_gmc3, DEFAULT_PRECISION);
    P.densityA_earth = math.round(density_earths, DEFAULT_PRECISION);

  }
  densityB(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.massB, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radiusB, RadiusUnits.km, RadiusUnits.m);
    var density = mass_kg / (4 / 3.0 * Math.PI * Math.pow(radius_m, 3));

    var density_gmc3 = this.unitConverter.convert(density, DensityUnits.kgm3, DensityUnits.gcm3);
    var density_earths = this.unitConverter.convert(density, DensityUnits.kgm3, DensityUnits.earths);

    P.densityB_kgm3 = math.round(density, LOW_PRECISION);
    P.densityB_gcm3 = math.round(density_gmc3, DEFAULT_PRECISION);
    P.densityB_earth = math.round(density_earths, DEFAULT_PRECISION);

  }

  hillSphere(celestial: Celestial, parent: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg_parent = this.unitConverter.convert(parent.mass, MassUnits.earths, MassUnits.kilograms);
    var mass_kg = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);
    var SMA_m = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);

    var hillSphere = SMA_m * (1 - celestial.eccentricity) * Math.pow(mass_kg / (3 * mass_kg_parent), 1.0 / 3);
    var hillSphere_AU = this.unitConverter.convert(hillSphere, LengthUnits.meters, LengthUnits.AU);
    var hillSphere_Gm = this.unitConverter.convert(hillSphere, LengthUnits.meters, LengthUnits.gigameters);
    var hillSphere_km = this.unitConverter.convert(hillSphere, LengthUnits.meters, LengthUnits.kilometers);

    P.hillSphere_AU = math.round(hillSphere_AU, DEFAULT_PRECISION);
    P.hillSphere_Gm = math.round(hillSphere_Gm, DEFAULT_PRECISION);
    P.hillSphere_km = math.round(hillSphere_km, DEFAULT_PRECISION);
  }

  rocheLimit(celestial: Celestial, parent: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg_parent = this.unitConverter.convert(parent.mass, MassUnits.earths, MassUnits.kilograms);
    var mass_kg = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radius, RadiusUnits.km, RadiusUnits.m);

    var rocheLimit = radius_m * Math.pow(2 * mass_kg_parent / mass_kg, 1.0 / 3);
    var rocheLimit_km = this.unitConverter.convert(rocheLimit, LengthUnits.meters, LengthUnits.kilometers);
    var rocheLimit_Gm = this.unitConverter.convert(rocheLimit, LengthUnits.meters, LengthUnits.gigameters);
    var rocheLimit_AU = this.unitConverter.convert(rocheLimit, LengthUnits.meters, LengthUnits.AU);

    P.rocheLimit_AU = math.round(rocheLimit_AU, DEFAULT_PRECISION);
    P.rocheLimit_Gm = math.round(rocheLimit_Gm, DEFAULT_PRECISION);
    P.rocheLimit_km = math.round(rocheLimit_km, LOW_PRECISION);
    P.rocheLimit_m = math.round(rocheLimit, INT_PRECISION);
  }
  rocheLimitAB(celestial: Celestial, P: DerivedCelestialProperties): void {
    //Roche limit testing for binary planets to make sure they don't fall apart
    var rocheLimitA = celestial.radiusA * Math.pow(2 * celestial.massB / celestial.massA, 1.0 / 3);
    var rocheLimitB = celestial.radiusB * Math.pow(2 * celestial.massA / celestial.massB, 1.0 / 3);

    var rocheLimitA_m = this.unitConverter.convert(rocheLimitA, LengthUnits.kilometers, LengthUnits.meters);
    var rocheLimitA_Gm = this.unitConverter.convert(rocheLimitA, LengthUnits.kilometers, LengthUnits.gigameters);
    var rocheLimitA_AU = this.unitConverter.convert(rocheLimitA, LengthUnits.kilometers, LengthUnits.AU);

    var rocheLimitB_m = this.unitConverter.convert(rocheLimitB, LengthUnits.kilometers, LengthUnits.meters);
    var rocheLimitB_Gm = this.unitConverter.convert(rocheLimitB, LengthUnits.kilometers, LengthUnits.gigameters);
    var rocheLimitB_AU = this.unitConverter.convert(rocheLimitB, LengthUnits.kilometers, LengthUnits.AU);

    P.rocheLimitA_AU = math.round(rocheLimitA_AU, DEFAULT_PRECISION);
    P.rocheLimitA_Gm = math.round(rocheLimitA_Gm, DEFAULT_PRECISION);
    P.rocheLimitA_km = math.round(rocheLimitA, LOW_PRECISION);
    P.rocheLimitA_m = math.round(rocheLimitA_m, INT_PRECISION);

    P.rocheLimitB_AU = math.round(rocheLimitB_AU, DEFAULT_PRECISION);
    P.rocheLimitB_Gm = math.round(rocheLimitB_Gm, DEFAULT_PRECISION);
    P.rocheLimitB_km = math.round(rocheLimitB, LOW_PRECISION);
    P.rocheLimitB_m = math.round(rocheLimitB_m, INT_PRECISION);
  }

  gravity(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radius, RadiusUnits.km, RadiusUnits.m);
    var gravity = Constants.G * mass_kg / Math.pow(radius_m, 2);

    var gravity_g = this.unitConverter.convert(gravity, GravityUnits.ms2, GravityUnits.g);

    P.gravity_ms2 = math.round(gravity, DEFAULT_PRECISION);
    P.gravity_g = math.round(gravity_g, DEFAULT_PRECISION);
  }

  //Binary
  gravityA(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.massA, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radiusA, RadiusUnits.km, RadiusUnits.m);
    var gravity = Constants.G * mass_kg / Math.pow(radius_m, 2);

    var gravity_g = this.unitConverter.convert(gravity, GravityUnits.ms2, GravityUnits.g);

    P.gravityA_ms2 = math.round(gravity, DEFAULT_PRECISION);
    P.gravityA_g = math.round(gravity_g, DEFAULT_PRECISION);
  }
  gravityB(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.massB, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radiusB, RadiusUnits.km, RadiusUnits.m);
    var gravity = Constants.G * mass_kg / Math.pow(radius_m, 2);

    var gravity_g = this.unitConverter.convert(gravity, GravityUnits.ms2, GravityUnits.g);

    P.gravityB_ms2 = math.round(gravity, DEFAULT_PRECISION);
    P.gravityB_g = math.round(gravity_g, DEFAULT_PRECISION);
  }

  mass(celestial: Celestial, P: DerivedCelestialProperties): void {
    var Me = celestial.mass;
    var kg = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.kilograms);
    var Mmoon = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.moons);
    var Mjup = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.jups);
    var Msun = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.suns);

    P.mass_sun = math.round(Msun, DEFAULT_PRECISION);
    P.mass_jup = math.round(Mjup, DEFAULT_PRECISION);
    P.mass_moon = math.round(Mmoon, DEFAULT_PRECISION);
    P.mass_kg = math.round(kg, INT_PRECISION);
  }

  //Binary planets
  massAB(celestial: Celestial, P: DerivedCelestialProperties): void {
    var Me = celestial.mass = celestial.massA + celestial.massB;
    var kg = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.kilograms);
    var Mmoon = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.moons);
    var Mjup = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.jups);
    var Msun = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.suns);

    P.mass_sun = math.round(Msun, DEFAULT_PRECISION);
    P.mass_jup = math.round(Mjup, DEFAULT_PRECISION);
    P.mass_moon = math.round(Mmoon, DEFAULT_PRECISION);
    P.mass_kg = math.round(kg, INT_PRECISION);
  }

  massA(celestial: Celestial, P: DerivedCelestialProperties): void {
    var Me = celestial.massA;
    var kg = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.kilograms);
    var Mmoon = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.moons);
    var Mjup = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.jups);
    var Msun = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.suns);

    P.massA_sun = math.round(Msun, DEFAULT_PRECISION);
    P.massA_jup = math.round(Mjup, DEFAULT_PRECISION);
    P.massA_moon = math.round(Mmoon, DEFAULT_PRECISION);
    P.massA_kg = math.round(kg, INT_PRECISION);
  }
  massB(celestial: Celestial, P: DerivedCelestialProperties): void {
    var Me = celestial.massB;
    var kg = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.kilograms);
    var Mmoon = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.moons);
    var Mjup = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.jups);
    var Msun = this.unitConverter.convert(Me, MassUnits.earths, MassUnits.suns);

    P.massB_sun = math.round(Msun, DEFAULT_PRECISION);
    P.massB_jup = math.round(Mjup, DEFAULT_PRECISION);
    P.massB_moon = math.round(Mmoon, DEFAULT_PRECISION);
    P.massB_kg = math.round(kg, INT_PRECISION);
  }


  orbitPeriod(celestial: Celestial, parent: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg_parent = this.unitConverter.convert(parent.mass, MassUnits.earths, MassUnits.kilograms);
    var mass_kg = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);
    var SMA_m = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);

    var period = 2 * Math.PI * Math.pow(Math.pow(SMA_m, 3) / (Constants.G * (mass_kg_parent + mass_kg)), 0.5);
    var period_min = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.minutes);
    var period_hour = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.hours);
    var period_day = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.days);
    var period_year = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.years);

    P.orbitPeriod_seconds = math.round(period, DEFAULT_PRECISION);
    P.orbitPeriod_minutes = math.round(period_min, DEFAULT_PRECISION);
    P.orbitPeriod_hours = math.round(period_hour, DEFAULT_PRECISION);
    P.orbitPeriod_days = math.round(period_day, DEFAULT_PRECISION);
    P.orbitPeriod_years = math.round(period_year, DEFAULT_PRECISION);

    /*
    * http://www.celestialnorth.org/FAQtoids/dazed_about_days_(solar_and_sidereal).htm
    */
    if (!celestial.binary) {
      P.orbitPeriod_localDays = math.round(period_hour / ((period_hour * celestial.sidereal) / (period_hour - celestial.sidereal)), DEFAULT_PRECISION); //buggy for venus
    } else {
      P.orbitPeriod_localDaysA = math.round(period_hour / ((period_hour * celestial.siderealA) / (period_hour - celestial.siderealA)), DEFAULT_PRECISION); //buggy for venus
      P.orbitPeriod_localDaysB = math.round(period_hour / ((period_hour * celestial.siderealB) / (period_hour - celestial.siderealB)), DEFAULT_PRECISION); //buggy for venus
    }



    var orbit: string = "";
    orbit += Math.floor(period_year) + (Math.floor(period_year) == 1 ? " year, " : " years, ");
    orbit += Math.floor(period_day % Constants.daysInYear) + (Math.floor(period_day % Constants.daysInYear) == 1 ? " day, " : " days, ");
    orbit += Math.floor(period_hour % 24) + (Math.floor(period_hour % 24) == 1 ? " hour, " : " hours, ");
    orbit += Math.floor(period_min % 60) + (Math.floor(period_min % 60) == 1 ? " minutes, and " : " minutes, and ");
    orbit += Math.floor(period % 60) + (Math.floor(period % 60) == 1 ? " second" : " seconds");

    P.orbitPeriod_concat = orbit;
  }

  sidereal(celestial: Celestial, P: DerivedCelestialProperties) {

    var period_hour = celestial.sidereal || 0;
    var period_min = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.minutes);
    var period_seconds = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.seconds);
    var period_day = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.days);
    var period_year = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.years);

    P.sidereal_seconds = math.round(period_seconds, DEFAULT_PRECISION);
    P.sidereal_minutes = math.round(period_min, DEFAULT_PRECISION);
    P.sidereal_hours = math.round(period_hour, DEFAULT_PRECISION);
    P.sidereal_days = math.round(period_day, DEFAULT_PRECISION);
    P.sidereal_years = math.round(period_year, DEFAULT_PRECISION);

    var orbit: string = "";
    orbit += Math.floor(period_year) + (Math.floor(period_year) == 1 ? " year, " : " years, ");
    orbit += Math.floor(period_day % Constants.daysInYear) + (Math.floor(period_day % Constants.daysInYear) == 1 ? " day, " : " days, ");
    orbit += Math.floor(period_hour % 24) + (Math.floor(period_hour % 24) == 1 ? " hour, " : " hours, ");
    orbit += Math.floor(period_min % 60) + (Math.floor(period_min % 60) == 1 ? " minutes, and " : " minutes, and ");
    orbit += Math.floor(period_seconds % 60) + (Math.floor(period_seconds % 60) == 1 ? " second" : " seconds");

    P.sidereal_concat = orbit;

  }

  siderealAB(celestial: Celestial, P: DerivedCelestialProperties) {

    var period_hour = celestial.siderealA || 0;
    var period_min = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.minutes);
    var period_seconds = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.seconds);
    var period_day = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.days);
    var period_year = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.years);

    P.siderealA_seconds = math.round(period_seconds, DEFAULT_PRECISION);
    P.siderealA_minutes = math.round(period_min, DEFAULT_PRECISION);
    P.siderealA_hours = math.round(period_hour, DEFAULT_PRECISION);
    P.siderealA_days = math.round(period_day, DEFAULT_PRECISION);
    P.siderealA_years = math.round(period_year, DEFAULT_PRECISION);

    var orbit: string = "";
    orbit += Math.floor(period_year) + (Math.floor(period_year) == 1 ? " year, " : " years, ");
    orbit += Math.floor(period_day % Constants.daysInYear) + (Math.floor(period_day % Constants.daysInYear) == 1 ? " day, " : " days, ");
    orbit += Math.floor(period_hour % 24) + (Math.floor(period_hour % 24) == 1 ? " hour, " : " hours, ");
    orbit += Math.floor(period_min % 60) + (Math.floor(period_min % 60) == 1 ? " minutes, and " : " minutes, and ");
    orbit += Math.floor(period_seconds % 60) + (Math.floor(period_seconds % 60) == 1 ? " second" : " seconds");

    P.siderealA_concat = orbit;

    /*Object B*/

    period_hour = celestial.siderealB || 0;
    period_min = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.minutes);
    period_seconds = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.seconds);
    period_day = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.days);
    period_year = this.unitConverter.convert(period_hour, TimeUnits.hours, TimeUnits.years);

    P.siderealB_seconds = math.round(period_seconds, DEFAULT_PRECISION);
    P.siderealB_minutes = math.round(period_min, DEFAULT_PRECISION);
    P.siderealB_hours = math.round(period_hour, DEFAULT_PRECISION);
    P.siderealB_days = math.round(period_day, DEFAULT_PRECISION);
    P.siderealB_years = math.round(period_year, DEFAULT_PRECISION);

    orbit = "";
    orbit += Math.floor(period_year) + (Math.floor(period_year) == 1 ? " year, " : " years, ");
    orbit += Math.floor(period_day % Constants.daysInYear) + (Math.floor(period_day % Constants.daysInYear) == 1 ? " day, " : " days, ");
    orbit += Math.floor(period_hour % 24) + (Math.floor(period_hour % 24) == 1 ? " hour, " : " hours, ");
    orbit += Math.floor(period_min % 60) + (Math.floor(period_min % 60) == 1 ? " minutes, and " : " minutes, and ");
    orbit += Math.floor(period_seconds % 60) + (Math.floor(period_seconds % 60) == 1 ? " second" : " seconds");

    P.siderealB_concat = orbit;
  }

  binaryOrbitPeriod(celestial: Celestial, P: DerivedCelestialProperties) {
    var massA = this.unitConverter.convert(celestial.massA, MassUnits.earths, MassUnits.kilograms);
    var massB = this.unitConverter.convert(celestial.massB, MassUnits.earths, MassUnits.kilograms);
    var d = this.unitConverter.convert(celestial.SMAAB, LengthUnits.gigameters, LengthUnits.meters);

    var period = 2 * Math.PI * Math.pow(Math.pow(d, 3) / (Constants.G * (massA + massB)), 0.5);
    var period_min = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.minutes);
    var period_hour = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.hours);
    var period_day = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.days);
    var period_year = this.unitConverter.convert(period, TimeUnits.seconds, TimeUnits.years);

    //P.binaryOrbitPeriod_localDaysA will implement later

    P.binaryOrbitPeriod_seconds = math.round(period, DEFAULT_PRECISION);
    P.binaryOrbitPeriod_minutes = math.round(period_min, DEFAULT_PRECISION);
    P.binaryOrbitPeriod_hours = math.round(period_hour, DEFAULT_PRECISION);
    P.binaryOrbitPeriod_days = math.round(period_day, DEFAULT_PRECISION);
    P.binaryOrbitPeriod_years = math.round(period_year, DEFAULT_PRECISION);

    var orbit: string = "";
    orbit += Math.floor(period_year) + (Math.floor(period_year) == 1 ? " year, " : " years, ");
    orbit += Math.floor(period_day % Constants.daysInYear) + (Math.floor(period_day % Constants.daysInYear) == 1 ? " day, " : " days, ");
    orbit += Math.floor(period_hour % 24) + (Math.floor(period_hour % 24) == 1 ? " hour, " : " hours, ");
    orbit += Math.floor(period_min % 60) + (Math.floor(period_min % 60) == 1 ? " minutes, and " : " minutes, and ");
    orbit += Math.floor(period % 60) + (Math.floor(period % 60) == 1 ? " second" : " seconds");

    P.binaryOrbitPeriod_concat = orbit;
  }

  mutualTidalLock(celestial: Celestial, P: DerivedCelestialProperties) {
    if (celestial.mutualTidalLock) {
      celestial.siderealA = P.binaryOrbitPeriod_hours;
      celestial.siderealB = celestial.siderealA;
    }
    this.siderealAB(celestial, P);
  }
  tidalLock(celestial: Celestial, P: DerivedCelestialProperties) {
    if (celestial.tidalLock) {
      celestial.sidereal = P.orbitPeriod_hours;
    }
    this.sidereal(celestial, P);
  }

  radius(celestial: Celestial, P: DerivedCelestialProperties): void {
    //Volumetric mean radius
    var km = celestial.radius;
    var Rmoon = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.moons);
    var Rearth = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.earths);
    var Rjup = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.jups);
    var Rsun = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.suns);

    P.radius_sun = math.round(Rsun, DEFAULT_PRECISION);
    P.radius_jup = math.round(Rjup, DEFAULT_PRECISION);
    P.radius_earth = math.round(Rearth, DEFAULT_PRECISION);
    P.radius_moon = math.round(Rmoon, DEFAULT_PRECISION);
  }

  //Binary planets
  radiusA(celestial: Celestial, P: DerivedCelestialProperties): void {
    //Volumetric mean radius
    var km = celestial.radiusA;
    var Rmoon = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.moons);
    var Rearth = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.earths);
    var Rjup = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.jups);
    var Rsun = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.suns);

    P.radiusA_sun = math.round(Rsun, DEFAULT_PRECISION);
    P.radiusA_jup = math.round(Rjup, DEFAULT_PRECISION);
    P.radiusA_earth = math.round(Rearth, DEFAULT_PRECISION);
    P.radiusA_moon = math.round(Rmoon, DEFAULT_PRECISION);
  }
  radiusB(celestial: Celestial, P: DerivedCelestialProperties): void {
    //Volumetric mean radius
    var km = celestial.radiusB;
    var Rmoon = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.moons);
    var Rearth = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.earths);
    var Rjup = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.jups);
    var Rsun = this.unitConverter.convert(km, RadiusUnits.km, RadiusUnits.suns);

    P.radiusB_sun = math.round(Rsun, DEFAULT_PRECISION);
    P.radiusB_jup = math.round(Rjup, DEFAULT_PRECISION);
    P.radiusB_earth = math.round(Rearth, DEFAULT_PRECISION);
    P.radiusB_moon = math.round(Rmoon, DEFAULT_PRECISION);
  }

  SMA(celestial: Celestial, P: DerivedCelestialProperties): void {
    var AU = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.AU);
    var kilometers = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.kilometers);
    var meters = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);

    P.SMA_AU = math.round(AU, DEFAULT_PRECISION);
    P.SMA_kilometers = math.round(kilometers, INT_PRECISION);
    P.SMA_meters = math.round(meters, INT_PRECISION);
  }

  SMAAB(celestial: Celestial, P: DerivedCelestialProperties): void {
    var AU = this.unitConverter.convert(celestial.SMAAB, LengthUnits.gigameters, LengthUnits.AU);
    var kilometers = this.unitConverter.convert(celestial.SMAAB, LengthUnits.gigameters, LengthUnits.kilometers);
    var meters = this.unitConverter.convert(celestial.SMAAB, LengthUnits.gigameters, LengthUnits.meters);

    var ratioA = celestial.massB / celestial.mass;
    var ratioB = celestial.massA / celestial.mass;

    P.SMAAB_AU = math.round(AU, DEFAULT_PRECISION);
    P.SMAAB_kilometers = math.round(kilometers, INT_PRECISION);
    P.SMAAB_meters = math.round(meters, INT_PRECISION);

    P.SMAA_AU = math.round(AU * ratioA, DEFAULT_PRECISION);
    P.SMAA_gigameters = math.round(celestial.SMAAB * ratioA, DEFAULT_PRECISION);
    P.SMAA_kilometers = math.round(kilometers * ratioA, INT_PRECISION);
    P.SMAA_meters = math.round(meters * ratioA, INT_PRECISION);

    P.SMAB_AU = math.round(AU * ratioB, DEFAULT_PRECISION);
    P.SMAB_gigameters = math.round(celestial.SMAAB * ratioB, DEFAULT_PRECISION);
    P.SMAB_kilometers = math.round(kilometers * ratioB, INT_PRECISION);
    P.SMAB_meters = math.round(meters * ratioB, INT_PRECISION);
  }

  temperatureAndLuminosity(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_suns = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.suns);
    var radius_m = this.unitConverter.convert(celestial.radius, RadiusUnits.km, RadiusUnits.m);

    var luminosity_suns = Math.pow(mass_suns, 3.5);
    var luminosity_W = this.unitConverter.convert(luminosity_suns, LuminosityUnits.suns, LuminosityUnits.watts);

    var temp_K = Math.pow(luminosity_W / (4 * Math.PI * Math.pow(radius_m, 2) * Constants.s), 1.0/4);

    var temp_C = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.celsius);
    var temp_F = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.surfaceTemperature_C = math.round(temp_C, INT_PRECISION);
    P.surfaceTemperature_F = math.round(temp_F, INT_PRECISION);
    P.surfaceTemperature_K = math.round(temp_K, INT_PRECISION);

    P.luminosity_sun = math.round(luminosity_suns, DEFAULT_PRECISION);
    P.luminosity_W = math.round(luminosity_W, INT_PRECISION);
  }

  //Handles surface temperature, insolation, etc.
  celestialSurface(celestial: Celestial, parent: Celestial, star: Celestial, star_P: DerivedCelestialProperties, P: DerivedCelestialProperties): void {
    var SMA_m;
    if (celestial.type == 'planet') {
      SMA_m = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
    } else {
      SMA_m = this.unitConverter.convert(parent.SMA, LengthUnits.gigameters, LengthUnits.meters);
    }

    var insolation = star_P.luminosity_W / (Math.pow(SMA_m, 2) * 4 * Math.PI);
    var insolation_earths = insolation / Constants.earthInsolationWatts;

    var temp_K = Math.pow(star_P.luminosity_W * (1 - celestial.albedo) / (16 * Math.PI * Constants.s * Math.pow(SMA_m, 2)), 0.25) + Number(celestial.greenhouse);
    var temp_C = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.celsius);
    var temp_F = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.surfaceTemperature_C = math.round(temp_C, INT_PRECISION);
    P.surfaceTemperature_F = math.round(temp_F, INT_PRECISION);
    P.surfaceTemperature_K = math.round(temp_K, INT_PRECISION);

    P.insolation_earths = math.round(insolation_earths, DEFAULT_PRECISION);
    P.insolation_W = math.round(insolation, INT_PRECISION);
  }

  //Binary
  celestialSurfaceA(celestial: Celestial, parent: Celestial, star: Celestial, star_P: DerivedCelestialProperties, P: DerivedCelestialProperties): void {
    var SMA_m;
    if (celestial.type == 'planet') {
      SMA_m = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
    } else {
      SMA_m = this.unitConverter.convert(parent.SMA, LengthUnits.gigameters, LengthUnits.meters);
    }

    var insolation = star_P.luminosity_W / (Math.pow(SMA_m, 2) * 4 * Math.PI);
    var insolation_earths = insolation / Constants.earthInsolationWatts;

    var temp_K = Math.pow(star_P.luminosity_W * (1 - celestial.albedo) / (16 * Math.PI * Constants.s * Math.pow(SMA_m, 2)), 0.25) + Number(celestial.greenhouse);
    var temp_C = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.celsius);
    var temp_F = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.surfaceTemperatureA_C = math.round(temp_C, INT_PRECISION);
    P.surfaceTemperatureA_F = math.round(temp_F, INT_PRECISION);
    P.surfaceTemperatureA_K = math.round(temp_K, INT_PRECISION);

    P.insolation_earths = math.round(insolation_earths, DEFAULT_PRECISION);
    P.insolation_W = math.round(insolation, INT_PRECISION);
  }
  celestialSurfaceB(celestial: Celestial, parent: Celestial, star: Celestial, star_P: DerivedCelestialProperties, P: DerivedCelestialProperties): void {
    var SMA_m;
    if (celestial.type == 'planet') {
      SMA_m = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
    } else {
      SMA_m = this.unitConverter.convert(parent.SMA, LengthUnits.gigameters, LengthUnits.meters);
    }

    var insolation = star_P.luminosity_W / (Math.pow(SMA_m, 2) * 4 * Math.PI);
    var insolation_earths = insolation / Constants.earthInsolationWatts;

    var temp_K = Math.pow(star_P.luminosity_W * (1 - celestial.albedo) / (16 * Math.PI * Constants.s * Math.pow(SMA_m, 2)), 0.25) + Number(celestial.greenhouse);
    var temp_C = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.celsius);
    var temp_F = this.unitConverter.convertTemperature(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.surfaceTemperatureB_C = math.round(temp_C, INT_PRECISION);
    P.surfaceTemperatureB_F = math.round(temp_F, INT_PRECISION);
    P.surfaceTemperatureB_K = math.round(temp_K, INT_PRECISION);

    P.insolation_earths = math.round(insolation_earths, DEFAULT_PRECISION);
    P.insolation_W = math.round(insolation, INT_PRECISION);
  }

  greenhouse(celestial: Celestial, P: DerivedCelestialProperties) {
    var temp_K = celestial.greenhouse;
    var temp_C = temp_K;
    var temp_F = this.unitConverter.convertTemperatureDifference(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.greenhouse_C = math.round(temp_C, LOW_PRECISION);
    P.greenhouse_F = math.round(temp_F, LOW_PRECISION);
  }

  //Binary
  greenhouseA(celestial: Celestial, P: DerivedCelestialProperties) {
    var temp_K = celestial.greenhouseA || 0;
    var temp_C = temp_K;
    var temp_F = this.unitConverter.convertTemperatureDifference(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.greenhouseA_C = math.round(temp_C, LOW_PRECISION);
    P.greenhouseA_F = math.round(temp_F, LOW_PRECISION);
  }
  greenhouseB(celestial: Celestial, P: DerivedCelestialProperties) {
    var temp_K = celestial.greenhouseB || 0;
    var temp_C = temp_K;
    var temp_F = this.unitConverter.convertTemperatureDifference(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.greenhouseB_C = math.round(temp_C, LOW_PRECISION);
    P.greenhouseB_F = math.round(temp_F, LOW_PRECISION);
  }

  obliquityAB(celestial: Celestial, P: DerivedCelestialProperties) {
    celestial.obliquityA = celestial.inclinationAB;
    celestial.obliquityB = celestial.inclinationAB;
  }

}
