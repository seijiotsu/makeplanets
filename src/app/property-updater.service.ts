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

    var d1 = Math.abs(SMA_m1 * (1 - A.eccentricity) - SMA_m2 * (1 - B.eccentricity));
    var d2 = Math.abs(SMA_m1 * (1 + A.eccentricity) - SMA_m2 * (1 - B.eccentricity));
    var d3 = Math.abs(SMA_m1 * (1 - A.eccentricity) - SMA_m2 * (1 + B.eccentricity));
    var d4 = Math.abs(SMA_m1 * (1 + A.eccentricity) - SMA_m2 * (1 + B.eccentricity));
    var d5 = Math.abs(SMA_m1 - SMA_m2);

    var max_dist = Math.max(d1, d2);
    max_dist = Math.max(max_dist, d3);
    max_dist = Math.max(max_dist, d4);
    max_dist = Math.max(max_dist, d5);

    return max_dist;
  }

  findAverageSiblingDistance(A: Celestial, B: Celestial): number {
    var SMA_m1 = this.unitConverter.convert(A.SMA, LengthUnits.gigameters, LengthUnits.meters);
    var SMA_m2 = this.unitConverter.convert(B.SMA, LengthUnits.gigameters, LengthUnits.meters);

    var d1 = Math.abs(SMA_m1 * (1 - A.eccentricity) - SMA_m2 * (1 - B.eccentricity));
    var d2 = Math.abs(SMA_m1 * (1 + A.eccentricity) - SMA_m2 * (1 - B.eccentricity));
    var d3 = Math.abs(SMA_m1 * (1 - A.eccentricity) - SMA_m2 * (1 + B.eccentricity));
    var d4 = Math.abs(SMA_m1 * (1 + A.eccentricity) - SMA_m2 * (1 + B.eccentricity));
    var d5 = Math.abs(SMA_m1 - SMA_m2);

    return (d1 + d2 + d3 + d4 + d5) / 5; //LOL I HAVE NO IDEA WHAT I'M DOING
  }

  angularDiameter(celestial: Celestial, relative: Celestial, parent: Celestial, relation: Relations): AngularDiameter {

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

    if (relation == Relations.GRANDPARENT || relation == Relations.PARENT_SIBLING) {
      par_SMA = this.unitConverter.convert(parent.SMA, LengthUnits.gigameters, LengthUnits.meters);
      par_r = this.unitConverter.convert(parent.radius, RadiusUnits.km, RadiusUnits.m);
      par_e = parent.eccentricity;
    }

    if (relation == Relations.CHILD) {
      d_min = rel_SMA * (1 - rel_e) - cel_r;
      d_avg = rel_SMA - cel_r;
      d_max = rel_SMA * (1 + rel_e) - cel_r;
    }

    if (relation == Relations.GRANDPARENT) {
      d_min = par_SMA * (1 - par_e) - cel_SMA * (1 + cel_e) - cel_r;
      d_avg = par_SMA - cel_r;
      d_max = par_SMA * (1 + par_e) + cel_SMA * (1 + cel_e) - cel_r;
    }

    if (relation == Relations.PARENT) {
      d_min = cel_SMA * (1 - cel_e) - cel_r;
      d_avg = cel_SMA - cel_r;
      d_max = cel_SMA * (1 + cel_e) - cel_r;
    }

    if (relation == Relations.PARENT_SIBLING) {
      d_min = this.findMinSiblingDistance(parent, relative) - cel_SMA * (1 + cel_e) - cel_r;
      d_avg = this.findAverageSiblingDistance(parent, relative) - cel_r;
      d_max = this.findMaxSiblingDistance(parent, relative) + cel_SMA * (1 + cel_e) - cel_r;
    }

    if (relation == Relations.SIBLING) {
      d_min = this.findMinSiblingDistance(celestial, relative) - cel_r;
      d_avg = this.findAverageSiblingDistance(celestial, relative) - cel_r;
      d_max = this.findMaxSiblingDistance(celestial, relative) - cel_r;
    }

    ad.min_deg = Math.atan((2 * rel_r) / d_min) * 180 / Math.PI;
    ad.avg_deg = Math.atan((2 * rel_r) / d_avg) * 180 / Math.PI;
    ad.max_deg = Math.atan((2 * rel_r) / d_max) * 180 / Math.PI;
    ad.celestial = relative;
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
    P.apoapsis_AU = math.round(apoapsis_AU, DEFAULT_PRECISION);
    P.periapsis_kilometers = math.round(periapsis_km, INT_PRECISION);
    P.periapsis_AU = math.round(periapsis_AU, DEFAULT_PRECISION);
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

  gravity(celestial: Celestial, P: DerivedCelestialProperties): void {
    var mass_kg = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);
    var radius_m = this.unitConverter.convert(celestial.radius, RadiusUnits.km, RadiusUnits.m);
    var gravity = Constants.G * mass_kg / Math.pow(radius_m, 2);

    var gravity_g = this.unitConverter.convert(gravity, GravityUnits.ms2, GravityUnits.g);

    P.gravity_ms2 = math.round(gravity, DEFAULT_PRECISION);
    P.gravity_g = math.round(gravity_g, DEFAULT_PRECISION);
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
    P.orbitPeriod_localDays = math.round(period_hour/((period_hour * celestial.sidereal) / (period_hour - celestial.sidereal)), DEFAULT_PRECISION); //buggy for venus

    var orbit: string = "";
    orbit += Math.floor(period_year) + (Math.floor(period_year) == 1 ? " year, " : " years, ");
    orbit += Math.floor(period_day % Constants.daysInYear) + (Math.floor(period_day % Constants.daysInYear) == 1 ? " day, " : " days, ");
    orbit += Math.floor(period_hour % 24) + (Math.floor(period_hour % 24) == 1 ? " hour, " : " hours, ");
    orbit += Math.floor(period_min % 60) + (Math.floor(period_min % 60) == 1 ? " minutes, and " : " minutes, and ");
    orbit += Math.floor(period % 60) + (Math.floor(period % 60) == 1 ? " second" : " seconds");

    P.orbitPeriod_concat = orbit;
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

  SMA(celestial: Celestial, P: DerivedCelestialProperties): void {
    var AU = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.AU);
    var kilometers = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.kilometers);
    var meters = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);

    P.SMA_AU = math.round(AU, DEFAULT_PRECISION);
    P.SMA_kilometers = math.round(kilometers, INT_PRECISION);
    P.SMA_meters = math.round(meters, INT_PRECISION);
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

  greenhouse(celestial: Celestial, P: DerivedCelestialProperties) {
    var temp_K = celestial.greenhouse;
    var temp_C = temp_K;
    var temp_F = this.unitConverter.convertTemperatureDifference(temp_K, TemperatureUnitTypes.kelvin, TemperatureUnitTypes.fahrenheit);

    P.greenhouse_C = math.round(temp_C, LOW_PRECISION);
    P.greenhouse_F = math.round(temp_F, LOW_PRECISION);
  }

}
