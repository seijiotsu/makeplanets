import { Injectable } from '@angular/core';

import { Celestial } from './models/celestial.model';
import { System } from './models/system.model';
import { CelestialTree } from './models/celestialTree';
import { DerivedCelestialProperties } from './models/derivedCelestialProperties';
import { Stability, StabilityObject, HillSphere } from './models/stabilities';
import { PropertyUpdaterService } from './property-updater.service';
import { AngularDiameter } from './models/angularDiameter';
import { Relations } from './models/relations';
import { UnitConverterService } from './unit-converter.service';
import { Observable, of, throwError } from 'rxjs';


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

import * as math from 'mathjs'
import { Constants } from './models/constants';
import { SystemService } from './system.service';
import { TideObject } from 'src/app/models/tides';

@Injectable({
  providedIn: 'root'
})
/*
The ActiveSystem service is a singleton that handles the
necessary calculations for the currently 'active' system
(most often triggered by navigating to the System component)
*/
export class ActiveSystemService {
  private system: System;
  private derivedProperties: DerivedCelestialProperties[];
  private stabilityTable: StabilityObject[][];
  private celestialIndexMap;
  private stabilityMap = {};
  private hillSphereMap = {};
  private tideMap = {};
  

  private angDZoom: number = 1;

  /*
  Boilerplate
  */
  constructor(
    private propertyUpdater: PropertyUpdaterService,
    private unitConverter: UnitConverterService,
    public systemAPI: SystemService
  ) { }

  getSystem(): System {
    return this.system;
  }
  setSystem(system: System): void {
    console.log("System being set...");
    this.system = system;

    //Initialize derivedProperties / stability table for all the celestials in the system

    this.stabilityTable = [];
    for (var i = 0; i < system.celestials.length; i++) {
      this.stabilityTable[i] = [];
    }

    this.derivedProperties = [];
    for (var i = 0; i < system.celestials.length; i++) {
      var dp = new DerivedCelestialProperties();
      dp._id = system.celestials[i]._id;
      this.derivedProperties.push(dp);
    }

    for (var i = 0; i < system.celestials.length; i++) {
      this.calculateDerivedProperties(system.celestials[i], 'all');
    }
    this.calculateDerivedProperties(system.celestials[0], 'stability');
    this.calculateDerivedProperties(system.celestials[0], 'ordering');
    console.log("Initialization complete!");
  }
  overwriteCelestials(celestials: Celestial[]): void {
    var system = this.getSystem();
    system.celestials = celestials;
    this.setSystem(system);
  }

  addSatellite(parent: Celestial, satelliteTemplate: Celestial): Celestial {
    var newCelestial = new Celestial("", "", "", "", 0, 0, 0, 0, 0, 0);

    newCelestial.name = "Unnamed Celestial";
    newCelestial._id = satelliteTemplate._id;
    newCelestial.parent_id = parent._id;
    newCelestial.owner = satelliteTemplate.owner;
    newCelestial.binary = satelliteTemplate.binary;


    if (parent.type == 'star') {
      newCelestial.type = 'planet';
    } else if (parent.type == 'planet') {
      newCelestial.type = 'moon';
    } else {
      return parent;
    }

    this.system.celestials.push(newCelestial);
    this.buildCelestialTree();
    this.updateOrdering();

    var dp = new DerivedCelestialProperties();
    dp._id = newCelestial._id;
    this.derivedProperties.push(dp);
    this.calculateDerivedProperties(newCelestial, 'all');
    this.calculateDerivedProperties(newCelestial, 'stability');
    this.calculateDerivedProperties(newCelestial, 'ordering');

    return newCelestial;
  }

  delete(celestial: Celestial): void {
    this.recursiveDelete(celestial);
    this.buildCelestialTree();
    this.updateOrdering();
  }

  private recursiveDelete(celestial: Celestial): void {
    var children: Celestial[] = this.getChildren(celestial);
    var index = this.getCelestialIndex(celestial);

    for (var i = 0; i < children.length; i++) {
      this.delete(children[i]);
    }

    console.log("Deleting " + celestial.name);
    this.system.celestials.splice(index, 1);
  }

  /*
  Code that deals with generating derived parameters for celestial
  objects. E.g. user inputs the radius in kilometers, and this code
  is responsible for translating the radius to meters, earths, etc.
  */
  getAllDerivedProperties(): DerivedCelestialProperties[] {
    return this.derivedProperties;
  }
  getDerivedProperties(celestial: Celestial): DerivedCelestialProperties {
    for (var i = 0; i < this.derivedProperties.length; i++) {
      if (this.derivedProperties[i]._id == celestial._id) return this.derivedProperties[i];
    }
  }

  getStability(c1: Celestial, c2: Celestial): StabilityObject {
    return this.stabilityMap[c1._id][c2._id];
  }
  getTide(c1: Celestial, c2: Celestial): TideObject {
    return this.tideMap[c1._id][c2._id];
  }

  getCelestialIndex(celestial: Celestial): number {
    return this.celestialIndexMap[celestial._id];
  }

  getParentObject(celestial: Celestial): Celestial {
    for (var i = 0; i < this.system.celestials.length; i++) {
      if (this.system.celestials[i]._id == celestial.parent_id) {
        return this.system.celestials[i]
      }
    }
    return null;
  }
  getSiblingObjects(celestial: Celestial): Celestial[] {
    var parent = this.getParentObject(celestial);
    if (parent == null) return [];
    var parent_id = parent._id;
    var siblings = [];
    for (var i = 0; i < this.system.celestials.length; i++) {
      if (this.system.celestials[i]._id == celestial._id) continue;
      if (this.system.celestials[i].parent_id == parent_id) {
        siblings.push(this.system.celestials[i]);
      }
    }
    return siblings;
  }
  getSiblingsInclusive(celestial: Celestial): Celestial[] {
    var parent = this.getParentObject(celestial);
    if (parent == null) return [];
    var parent_id = parent._id;
    var siblings = [];
    for (var i = 0; i < this.system.celestials.length; i++) {
      if (this.system.celestials[i].parent_id == parent_id) {
        siblings.push(this.system.celestials[i]);
      }
    }
    return siblings;
  }
  getParentSiblingObjects(celestial: Celestial): Celestial[] {
    var parent = this.getParentObject(celestial);
    if (parent == null) return [];
    return this.getSiblingObjects(parent);
  }
  getParentSiblingsInclusive(celestial: Celestial): Celestial[] {
    var parent = this.getParentObject(celestial);
    if (parent == null) return [];
    return this.getSiblingsInclusive(parent);
  }

  getChildren(celestial: Celestial): Celestial[] {
    var children: Celestial[] = [];
    for (var i = 0; i < this.system.celestials.length; i++) {
      if (this.system.celestials[i].parent_id == celestial._id) {
        children.push(this.system.celestials[i]);
      }
    }
    return children;
  }
  getStar(celestial: Celestial): Celestial {
    //TODO: implement error checking
    if (celestial.type == 'star') {
      return celestial;
    } else if (celestial.type == 'planet') {
      return this.getParentObject(celestial);
    } else if (celestial.type == 'moon') {
      return this.getParentObject(this.getParentObject(celestial));
    }
  }
  getCelestial(id: string): Celestial {
    for (var i = 0; i < this.system.celestials.length; i++) {
      if (this.system.celestials[i]._id == id) {
        return this.system.celestials[i];
      }
    }
  }

  hasParent(celestial: Celestial): boolean {
    var parent = this.getParentObject(celestial);
    if (parent == null) return false;
    return true;
  }
  isParent(celestial: Celestial, potentialParent: Celestial): boolean {
    return this.hasParent(celestial) && celestial.parent_id == potentialParent._id;
  }
  isGrandparent(celestial: Celestial, potentialGrandparent: Celestial): boolean {
    return this.hasParent(celestial) && this.hasParent(this.getParentObject(celestial)) && this.getParentObject(celestial).parent_id == potentialGrandparent._id;
  }
  isParentSibling(celestial: Celestial, potentialParentSibling: Celestial): boolean {
    return this.hasParent(celestial) && this.getParentObject(celestial).parent_id == potentialParentSibling.parent_id && !this.isParent(celestial, potentialParentSibling);
  }
  isChild(celestial: Celestial, potentialChild: Celestial) {
    return this.hasParent(potentialChild) && celestial._id == potentialChild.parent_id;
  }
  isSibling(celestial: Celestial, potentialSibling: Celestial) {
    return this.hasParent(celestial) && this.hasParent(potentialSibling) && celestial.parent_id == potentialSibling.parent_id;
  }

  getAllCelestials(): Celestial[] {
    return this.system.celestials;
  }
  getNumCelestials(): number {
    return this.system.celestials.length;
  }

  updateOrdering(): void {
    this.sortSystemCelestials(this.system.celestials);
    this.updateIndexMap();
  }

  calculateDerivedProperties(celestial: Celestial, p: string) {
    var properties: DerivedCelestialProperties = this.getDerivedProperties(celestial);
    var star: Celestial = this.getStar(celestial);
    var parent: Celestial = this.getParentObject(celestial);
    var children: Celestial[] = this.getChildren(celestial);
    var siblings: Celestial[] = this.getSiblingObjects(celestial);
    var inclusiveSiblings: Celestial[] = this.getSiblingsInclusive(celestial);
    var all: boolean = p == 'all';
    var isStar: boolean = celestial.type == 'star';
    var isBinary: boolean = celestial.binary;

    //Tides and stability update the same properties
    if (p == 'tides') p = 'stability';

    /*
     * Make sure all celestials are kept in sorted order. Special sort function
     * for the system as a whole.
     */
    if (p == 'ordering' || p == 'SMA') {
      this.updateOrdering();
      this.buildCelestialTree();
    }

    //TODO: change orbit periods of all child objects when parent's mass changes

    if (all || p == 'SMA' || p == 'stability') {
      this.propertyUpdater.SMA(celestial, properties);
    }

    if (all || p == 'SMA' || p == 'eccentricity' || p == 'stability') {
      this.propertyUpdater.apoapsisPeriapsis(celestial, properties);
    }

    if (all || p == 'SMA' || p == 'mass' || p == 'stability' || p == 'sidereal') {

      if (!isStar) {
        this.propertyUpdater.orbitPeriod(celestial, parent, properties);
      }
    }

    if (all || p == 'mass' || p == 'stability') {
      if(!isBinary) this.propertyUpdater.mass(celestial, properties);
    }
    if (all && isBinary || p == 'massA' || p == 'massB') {
      this.propertyUpdater.massAB(celestial, properties);
    }

    if (all || p == 'radius') {
      this.propertyUpdater.radius(celestial, properties);
    }

    if (all || p == 'mass' || p == 'radius' || p == 'stability') {
      if (!isBinary) this.propertyUpdater.density(celestial, properties);
    }

    if (all || p == 'mass' || p == 'radius' || p == 'stability') {
      if (!isBinary) this.propertyUpdater.gravity(celestial, properties);
    }

    if (all || p == 'SMA' || p == 'mass' || p == 'stability') {

      if (!isStar) {
        this.propertyUpdater.hillSphere(celestial, parent, properties);
      }
    }

    if (p == 'SMA' || p == 'mass' || p == 'stability') {
      this.refreshStabilities();
      this.refreshTides();
    }

    if ((all || p == 'mass' || p == 'radius') && celestial.type == 'star') {
      this.propertyUpdater.temperatureAndLuminosity(celestial, properties);

      //Update surface temperatures of all child planets
      for (var i = 0; i < this.system.celestials.length; i++) {
        if (this.system.celestials[i].type != 'star') {
          this.propertyUpdater.celestialSurface(this.system.celestials[i], this.getParentObject(this.system.celestials[i]), celestial, properties, this.getDerivedProperties(this.system.celestials[i]));
        }
      }
    }

    if (p == 'albedo' || p == 'greenhouse') {
      this.propertyUpdater.celestialSurface(celestial, parent, star, this.getDerivedProperties(star), properties);
    }

    if (celestial.type == 'planet') {
      if (all || p == 'greenhouse') {
        this.propertyUpdater.greenhouse(celestial, properties);
      }
    }

    if (all || p == 'SMAAB' || p == 'massA' || p == 'massB') {
      this.propertyUpdater.SMAAB(celestial, properties);
    }

    /*
     * Handle binary planets
     */
    if (all && isBinary || p == 'massA') this.propertyUpdater.massA(celestial, properties);
    if (all && isBinary || p == 'radiusA') this.propertyUpdater.radiusA(celestial, properties);
    if (all && isBinary || p == 'massA' || p == 'radiusA') {
      this.propertyUpdater.densityA(celestial, properties);
      this.propertyUpdater.gravityA(celestial, properties);
    }
    if (p == 'albedoA' || p == 'greenhouseA') {
      this.propertyUpdater.celestialSurfaceA(celestial, parent, star, this.getDerivedProperties(star), properties);
    }
    if (celestial.type == 'planet') {
      if (all && isBinary || p == 'greenhouseA') {
        this.propertyUpdater.greenhouseA(celestial, properties);
      }
    }

    if (all && isBinary || p == 'massB') this.propertyUpdater.massB(celestial, properties);
    if (all && isBinary || p == 'radiusB') this.propertyUpdater.radiusB(celestial, properties);
    if (all && isBinary || p == 'massB' || p == 'radiusB') {
      this.propertyUpdater.densityB(celestial, properties);
      this.propertyUpdater.gravityB(celestial, properties);
    }
    if (p == 'albedoB' || p == 'greenhouseB') {
      this.propertyUpdater.celestialSurfaceB(celestial, parent, star, this.getDerivedProperties(star), properties);
    }
    if (celestial.type == 'planet') {
      if (all && isBinary || p == 'greenhouseB') {
        this.propertyUpdater.greenhouseB(celestial, properties);
      }
    }

  }

  refreshTides(): void {
    console.log("Building tide tree...", this.system.celestials);
    for (var i = 0; i < this.system.celestials.length; i++) {
      var celestial: Celestial = this.system.celestials[i];
      console.log("=====>" + celestial.name);

      var celTidesMap = {};

      var properties: DerivedCelestialProperties = this.getDerivedProperties(celestial);
      var star: Celestial = this.getStar(celestial);
      var parent: Celestial = this.getParentObject(celestial);
      var children: Celestial[] = this.getChildren(celestial);
      var siblings: Celestial[] = this.getSiblingObjects(celestial);
      var inclusiveSiblings: Celestial[] = this.getSiblingsInclusive(celestial);
      var isStar: boolean = celestial.type == 'star';

      if (isStar) continue;

      var radius_m = this.unitConverter.convert(celestial.radius, LengthUnits.kilometers, LengthUnits.meters);

      for (var j = 0; j < siblings.length; j++) {
        var sibling: Celestial = siblings[j];
        var mass_kg = this.unitConverter.convert(sibling.mass, MassUnits.earths, MassUnits.kilograms);

        var min_dist = this.propertyUpdater.findMinSiblingDistance(celestial, sibling);
        var avg_dist = this.propertyUpdater.findAverageSiblingDistance(celestial, sibling);
        var max_dist = this.propertyUpdater.findMaxSiblingDistance(celestial, sibling);

        var t = new TideObject();
        t.min = this.calculateTidalStrength(mass_kg, radius_m, min_dist);
        t.avg = this.calculateTidalStrength(mass_kg, radius_m, avg_dist);
        t.max = this.calculateTidalStrength(mass_kg, radius_m, max_dist);

        celTidesMap[sibling._id] = this.formatTides(t);
      }

      for (var j = 0; j < children.length; j++) {
        var child: Celestial = children[j];
        var SMA_m = this.unitConverter.convert(child.SMA, LengthUnits.gigameters, LengthUnits.meters);
        var mass_kg = this.unitConverter.convert(child.mass, MassUnits.earths, MassUnits.kilograms);

        var min_dist = SMA_m * (1 - child.eccentricity);
        var max_dist = SMA_m * (1 + child.eccentricity);

        var t = new TideObject();
        t.min = this.calculateTidalStrength(mass_kg, radius_m, min_dist);
        t.avg = this.calculateTidalStrength(mass_kg, radius_m, SMA_m);
        t.max = this.calculateTidalStrength(mass_kg, radius_m, max_dist);

        celTidesMap[child._id] = this.formatTides(t);
      }

      var parent_mass_kg = this.unitConverter.convert(parent.mass, MassUnits.earths, MassUnits.kilograms);
      var SMA_m = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
      var min_dist = SMA_m * (1 - celestial.eccentricity);
      var avg_dist = SMA_m
      var max_dist = SMA_m * (1 + celestial.eccentricity);
      var t_parent = new TideObject();
      t_parent.min = this.calculateTidalStrength(parent_mass_kg, radius_m, min_dist);
      t_parent.avg = this.calculateTidalStrength(parent_mass_kg, radius_m, SMA_m);
      t_parent.max = this.calculateTidalStrength(parent_mass_kg, radius_m, max_dist);
      celTidesMap[parent._id] = this.formatTides(t_parent);

      if (celestial.type == 'moon') {
        var star_mass_kg = this.unitConverter.convert(star.mass, MassUnits.earths, MassUnits.kilograms);
        SMA_m = this.unitConverter.convert(parent.SMA, LengthUnits.gigameters, LengthUnits.meters);
        min_dist = SMA_m * (1 - parent.eccentricity);
        avg_dist = SMA_m
        max_dist = SMA_m * (1 + parent.eccentricity);
        var t_star = new TideObject();
        t_star.min = this.calculateTidalStrength(star_mass_kg, radius_m, min_dist);
        t_star.avg = this.calculateTidalStrength(star_mass_kg, radius_m, SMA_m);
        t_star.max = this.calculateTidalStrength(star_mass_kg, radius_m, max_dist);
        celTidesMap[star._id] = this.formatTides(t_star);
      }

      this.tideMap[celestial._id] = celTidesMap;
    }
  }

  calculateTidalStrength(targetMass: number /*kg*/, subjectRadius: number /*m*/, targetSMA: number /*m*/): number {
    return (2 * Constants.G * targetMass * subjectRadius) / Math.pow(targetSMA, 3);
  }

  formatTides(T: TideObject): TideObject {
    T.min = this.formatTideProperty(T.min / Constants.MOON_TIDE_FORCE_N);
    T.avg = this.formatTideProperty(T.avg / Constants.MOON_TIDE_FORCE_N);
    T.max = this.formatTideProperty(T.max / Constants.MOON_TIDE_FORCE_N);

    return T;
  }

  formatTideProperty(n: number): number {
    if (n > 100) {
      return math.round(n, 0);
    } else if (n > 1) {
      return math.round(n, 3);
    } else {
      return math.round(n, 5);
    }
  }

  refreshStabilities(): void {
    console.log("Building stability tree...", this.system.celestials);
    for (var i = 0; i < this.system.celestials.length; i++) {
      var celestial: Celestial = this.system.celestials[i];
      console.log("=====>" + celestial.name);

      var celStabilityMap = {};

      var properties: DerivedCelestialProperties = this.getDerivedProperties(celestial);
      var star: Celestial = this.getStar(celestial);
      var parent: Celestial = this.getParentObject(celestial);
      var children: Celestial[] = this.getChildren(celestial);
      var siblings: Celestial[] = this.getSiblingObjects(celestial);
      var inclusiveSiblings: Celestial[] = this.getSiblingsInclusive(celestial);
      var isStar: boolean = celestial.type == 'star';

      if (isStar) continue;

      var mass_kg = this.unitConverter.convert(parent.mass, MassUnits.earths, MassUnits.kilograms);

      var SMA_m1 = this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.meters);
      var mass_kg1 = this.unitConverter.convert(celestial.mass, MassUnits.earths, MassUnits.kilograms);

      var parentCelestialForce = Constants.G * mass_kg * mass_kg1 / Math.pow(SMA_m1, 2);

      var isStable = true;
      var isUnstable = false;

      for (var j = 0; j < siblings.length; j++) {
        var sibling: Celestial = siblings[j];

        var SMA_m2 = this.unitConverter.convert(sibling.SMA, LengthUnits.gigameters, LengthUnits.meters);
        var mass_kg2 = this.unitConverter.convert(sibling.mass, MassUnits.earths, MassUnits.kilograms);

        var min_dist = this.propertyUpdater.findMinSiblingDistance(celestial, sibling);
        var celestialSatelliteForce = Constants.G * mass_kg2 * mass_kg1 / Math.pow(min_dist, 2);
        var ratio = parentCelestialForce * 1.0 / celestialSatelliteForce;

        if (ratio > 1) {
          ratio = math.round(ratio, 5);
        } else {
          ratio = math.round(ratio, 2);
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

        celStabilityMap[sibling._id] = stability;
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

      if (celestial.type == 'moon') {
        var parentHillSphere = this.getDerivedProperties(parent).hillSphere_Gm;

        if (celestial.SMA > parentHillSphere) {
          S.hillSphere = HillSphere.Unstable;
          S.stability = Stability.Unstable;
          S.class = "mkp-stability-unstable";
        } else if (celestial.SMA > parentHillSphere / 3) {
          S.hillSphere = HillSphere.PotentiallyUnstable;
          if (S.stability == Stability.Stable) S.stability = Stability.Unstable;
          S.class = "mkp-stability-likely-unstable";
        } else {
          S.hillSphere = HillSphere.Stable;
        }

      }

      celStabilityMap[celestial._id] = S;

      this.stabilityMap[celestial._id] = celStabilityMap;

    }

    console.log("Stability tree built!", this.stabilityMap);
  }

  getAngDZoom(): number {
    return this.angDZoom;
  }
  angDZoomIn(): void {
    this.angDZoom *= 2;
  }
  angDZoomOut(): void {
    this.angDZoom /= 2;
  }
  angDZoomReset(): void {
    this.angDZoom = 1;
  }

  handleAngularDiameterDrawing(s, celestial: Celestial, draw: boolean[]): void {
    s.clear();

    var WIDTH: number = s.node.clientWidth;
    var HEIGHT: number = s.node.clientHeight;

    var angularDiameterScaling = 40 / this.getAngDZoom();

    var DEGREE = WIDTH / angularDiameterScaling;

    var celestialsToDraw: AngularDiameter[] = [];

    for (var i = 0; i < draw.length; i++) {
      if (draw[i]) {
        var c = this.system.celestials[i]
        var ad: AngularDiameter;

        var relation: Relations = this.getRelation(celestial, c);
        celestialsToDraw.push(this.propertyUpdater.angularDiameter(celestial, c, this.getParentObject(celestial), relation));
      }
    }

    //RENDER THE CELESTIALS
    var min_width_used = 0;
    var avg_width_used = 0;
    var max_width_used = 0;
    for (var i = 0; i < celestialsToDraw.length; i++) {
      var ad = celestialsToDraw[i];
      min_width_used += ad.min_deg * DEGREE * 2;
      avg_width_used += ad.avg_deg * DEGREE * 2;
      max_width_used += ad.max_deg * DEGREE * 2;
    }

    var min_whitespace = (WIDTH - min_width_used) / (celestialsToDraw.length + 1);
    var avg_whitespace = (WIDTH - avg_width_used) / (celestialsToDraw.length + 1);
    var max_whitespace = (WIDTH - max_width_used) / (celestialsToDraw.length + 1);

    //var moon = s.circle(WIDTH / 2, HEIGHT / 2, DEGREE * 6);

    //For now we only draw average distance sizes
    var x = 0;
    var y = HEIGHT / 2;
    for (var i = 0; i < celestialsToDraw.length; i++) {
      var r = celestialsToDraw[i].avg_deg * DEGREE;

      x += avg_whitespace;
      x += r;
      s.circle(x, y, r);
      s.text(x, y + r + DEGREE, celestialsToDraw[i].celestial.name);
      x += r;
    }

    var moon = s.circle(0, 0, DEGREE/2).attr({ fill: "grey", fillOpacity: 0.8 });

    function moveFunc(ev, x, y) {
      moon.attr({ cx: ev.offsetX, cy: ev.offsetY });
    };

    s.mousemove(moveFunc);
  }

  getRelation(celestial: Celestial, relative: Celestial) {
    if (this.isParent(celestial, relative)) {
      return Relations.PARENT;
    } else if (this.isSibling(celestial, relative)) {
      return Relations.SIBLING;
    } else if (this.isChild(celestial, relative)) {
      return Relations.CHILD;
    } else if (this.isParentSibling(celestial, relative)) {
      return Relations.PARENT_SIBLING;
    } else if (this.isGrandparent(celestial, relative)) {
      return Relations.GRANDPARENT;
    }
  }

  /*
  Code that deals with the tree view in the nav bar of the System
  component.

  The CelestialTree object should really actually be
  called CelestialTreeNode.
  */

  private celestialTree: CelestialTree[];

  getCelestialTree(): CelestialTree[] {
    return this.celestialTree;
  }
  buildCelestialTree(): void {
    console.log("Building celestial tree...");
    var celestialTree: CelestialTree[] = [];
    var flatCelestialTree: CelestialTree[] = [];

    this.populateCelestialTree(celestialTree, flatCelestialTree);
    console.log("Celestial tree populated...");
    this.sortObjectsByOrbit(celestialTree);
    console.log("Objects sorted by orbit...");

    this.celestialTree = celestialTree;
    console.log("Celestial tree built!");
  }

  private populateCelestialTree(celestialTree: CelestialTree[],
    flatCelestialTree: CelestialTree[]): void {

    var _idHashSet = {};

    var celestialsClone: Celestial[] = this.system.celestials.slice(0);

    //Fill celestialTree and flatCelestialTree with CelestialTree objects
    //that represent each Celestial object in this.system.celestials
    var i = 0;
    var k = 0;
    while (celestialsClone.length != 0 && k < 1000) {
      var celestial = celestialsClone[i];
      if (celestial.parent_id == "root") {
        this.addtoCelestialTree(celestialTree, flatCelestialTree, celestial);
        celestialsClone.splice(i, 1);
        _idHashSet[celestial._id] = true;
      } else {
        if (_idHashSet.hasOwnProperty(celestial.parent_id)) {
          this.appendChildCelestial(flatCelestialTree, celestial);
          celestialsClone.splice(i, 1);
          _idHashSet[celestial._id] = true;
        } else {
          i++;
        }
      }

      i %= celestialsClone.length;
      k++;
    }
  }

  //Two helper functions for the populateCelestialTree function
  private addtoCelestialTree(tree: CelestialTree[], flatTree: CelestialTree[], celestial: Celestial): void {
    var treeObj = new CelestialTree();
    treeObj.parent_id = celestial.parent_id;
    treeObj.celestial = celestial;
    treeObj.children = [];
    tree.push(treeObj);
    flatTree.push(treeObj);
  }
  private appendChildCelestial(flatTree: CelestialTree[], celestial: Celestial): void {
    for (var i = 0; i < flatTree.length; i++) {
      if (flatTree[i].celestial._id == celestial.parent_id) {
        var nObj = new CelestialTree();
        nObj.celestial = celestial;
        nObj.children = [];
        nObj.parent_id = celestial.parent_id;
        flatTree[i].children.push(nObj);

        flatTree.push(nObj);
        break;

      }
    }
  }


  private sortCelestialTreeCelestials(array: CelestialTree[]): void {
    var swapped = true;
    while (swapped) {
      swapped = false;

      for (var i = 1; i < array.length; i++) {
        if (array[i - 1].celestial.SMA > array[i].celestial.SMA) {
          var temp = array[i - 1];
          array[i - 1] = array[i];
          array[i] = temp;
          swapped = true;
        }
      }
    }
  }

  private sortSystemCelestials(array: Celestial[]): void {
    var swapped = true;
    while (swapped) {
      swapped = false;

      for (var i = 1; i < array.length; i++) {
        var c1 = array[i - 1];
        var c2 = array[i];

        var SMA1 = c1.SMA;
        var SMA2 = c2.SMA;

        if (c1.type == 'moon') {
          SMA1 = math.chain(SMA1).add(this.getParentObject(c1).SMA);
        }
        if (c2.type == 'moon') {
          SMA2 += math.chain(SMA2).add(this.getParentObject(c2).SMA);
        }

        if (SMA1 > SMA2) {
          var temp = array[i - 1];
          array[i - 1] = array[i];
          array[i] = temp;
          swapped = true;
        }
      }
    }

  }

  private updateIndexMap(): void {
    var indexMap = {};
    for (var i = 0; i < this.system.celestials.length; i++) {
      indexMap[this.system.celestials[i]._id] = i;
    }

    this.celestialIndexMap = indexMap;
  }

  private sortObjectsByOrbit(celestialTree: CelestialTree[]): CelestialTree[] {
    if (celestialTree.length == 0) {
      console.log("Tree is empty! Cannot sort!");
      return celestialTree;
    }
    var celestialGrid = [];
    //we assume there is only one star
    this.sortCelestialTreeCelestials(celestialTree[0].children);
    for (var i = 0; i < celestialTree[0].children.length; i++) {
      this.sortCelestialTreeCelestials(celestialTree[0].children[i].children);
    }

    for (var i = 0; i < celestialTree[0].children.length; i++) {
      celestialGrid[i] = [celestialTree[0].children[i].celestial];

      var children = celestialTree[0].children[i].children;
      for (var j = 0; j < children.length; j++) {
        celestialGrid[i].push(children[j].celestial);
      }
    }

    return celestialGrid;
  }
}
