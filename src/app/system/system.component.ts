import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { SystemService } from '../system.service';
import { ActiveSystemService } from '../active-system.service';

import { Celestial } from '../models/celestial.model';
import { System } from '../models/system.model';
import { CelestialTree } from '../models/celestialTree';
import { DerivedCelestialProperties } from '../models/derivedCelestialProperties';

import { Mode } from '../models/modes';
import { Stability } from '../models/stabilities';
import { ExporterService } from '../exporter.service';
import { SpaceEngineFileset } from '../models/export/spaceEngineFileset';
import { UnitConverterService } from '../unit-converter.service';

import { LengthUnits, MassUnits, RadiusUnits, TemperatureUnitTypes } from '../models/units';

declare var Snap: any;
declare var mina: any;

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {
  @Input() systemID: string;
  @Input() selectedCelestial: Celestial;
  @Input() mode: Mode;
  @Input() Mode = Mode;
  @Input() Stability = Stability;
  @Input() selectedAngDCelestial: Celestial;
  @Input() selectedTideCelestial: Celestial;

  @Input() selectedAngDCelestialSiblings: Celestial[];
  @Input() selectedAngDCelestialParentSiblings: Celestial[];
  @Input() selectedAngDCelestialParents: Celestial[];
  @Input() selectedAngDCelestialChildren: Celestial[];

  @Input() selectedTideCelestialSiblings: Celestial[];
  @Input() selectedTideCelestialParentSiblings: Celestial[];
  @Input() selectedTideCelestialParents: Celestial[];
  @Input() selectedTideCelestialChildren: Celestial[];

  @Input() selectedAngDCelestialChecked: boolean[] = [];

  @Input() SEExportFileset: SpaceEngineFileset;


  private angularDiameterCanvas = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private systemAPI: SystemService,
    public activeSystem: ActiveSystemService,
    public exporter: ExporterService,
    public unitConverter: UnitConverterService
  ) { }

  ngOnInit() {
    this.getSystemID();
    this.systemAPI.getSystem(this.systemID)
      .subscribe(res => {
        console.log(res);
        this.activeSystem.setSystem(res);
        this.refreshCelestialTree();
      }, err => {
        console.log(err);
      });
  }

  addSatellite(celestial: Celestial): void {
    this.systemAPI.newCelestial()
      .subscribe(res => {
        var newCelestial = this.activeSystem.addSatellite(celestial, res);
        this.select(newCelestial);
      }, err => {
        console.log(err);
      });
  }

  saveSystem(): void {
    this.systemAPI.putSystem(this.activeSystem.getSystem())
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  delete(celestial: Celestial): void {
    if (this.activeSystem.hasParent(this.selectedCelestial)) {
      this.selectedCelestial = this.activeSystem.getParentObject(this.selectedCelestial);
    }
    this.activeSystem.delete(celestial);
  }

  isInAngularDiameterMode(): boolean {
    return this.mode == Mode.AngularDiameterView;
  }
  getAngularDiameterCanvas() {
    return this.angularDiameterCanvas;
  }
  initializeAngularDiameterCanvas() {
    this.angularDiameterCanvas = Snap("#angularDiameter");
  }

  selectedCelestialChanged(property) {
    this.activeSystem.calculateDerivedProperties(this.selectedCelestial, property);
    console.log("All done changing derived properties!");
  }

  celestialChanged(celestial: Celestial, property: string) {
    this.activeSystem.calculateDerivedProperties(celestial, property);
  }

  getSystemID(): void {
    this.systemID = this.route.snapshot.paramMap.get('id');
  }

  refreshCelestialTree(): void {
    this.activeSystem.buildCelestialTree();
  }

  select(celestial): void {
    this.setMode(Mode.CelestialView);
    this.selectedCelestial = celestial;
  }

  zoomAngDCanvas(direction: string) {
    switch (direction) {
      case "in": {
        this.activeSystem.angDZoomIn();
        break;
      }
      case "out": {
        this.activeSystem.angDZoomOut();
        break;
      }
      case "reset": {
        this.activeSystem.angDZoomReset();
        break;
      }
    }

    this.activeSystem.handleAngularDiameterDrawing(this.getAngularDiameterCanvas(), this.selectedAngDCelestial, this.selectedAngDCelestialChecked);
  }

  updateAngD(e): void {
    if (this.isInAngularDiameterMode()) {
      this.getAngularDiameterCanvas().clear();
      var celestial: Celestial = this.activeSystem.getCelestial(e.target.value);
      this.selectedAngDCelestial = celestial;

      this.selectedAngDCelestialSiblings = this.activeSystem.getSiblingObjects(celestial);
      this.selectedAngDCelestialParents = [];
      if (celestial.type == 'moon') this.selectedAngDCelestialParents.push(this.activeSystem.getParentObject(this.activeSystem.getParentObject(celestial)));
      this.selectedAngDCelestialParents.push(this.activeSystem.getParentObject(celestial));
      this.selectedAngDCelestialChildren = this.activeSystem.getChildren(celestial);
      this.selectedAngDCelestialParentSiblings = this.activeSystem.getParentSiblingObjects(celestial);

      for (var i = 0; i < this.activeSystem.getNumCelestials(); i++) {
        this.selectedAngDCelestialChecked[i] = false;
      }
    }
  }
  updateTide(e): void {
    var celestial: Celestial = this.activeSystem.getCelestial(e.target.value);
    this.selectedTideCelestial = celestial;

    this.selectedTideCelestialSiblings = this.activeSystem.getSiblingObjects(celestial);
    this.selectedTideCelestialParents = [];
    if (celestial.type == 'moon') this.selectedTideCelestialParents.push(this.activeSystem.getParentObject(this.activeSystem.getParentObject(celestial)));
    this.selectedTideCelestialParents.push(this.activeSystem.getParentObject(celestial));
    this.selectedTideCelestialChildren = this.activeSystem.getChildren(celestial);
    this.selectedTideCelestialParentSiblings = this.activeSystem.getParentSiblingObjects(celestial);
  }

  drawAngDCanvas(e) {
    this.activeSystem.handleAngularDiameterDrawing(this.getAngularDiameterCanvas(), this.selectedAngDCelestial, this.selectedAngDCelestialChecked);
  }

  setMode(mode: Mode): void {
    /*
     * Make sure to clear old modes when switching
     */
    if (this.mode == Mode.AngularDiameterView && mode != Mode.AngularDiameterView) {
      this.getAngularDiameterCanvas().clear();
    }
    if (this.mode == Mode.ImportExportView && mode != Mode.ImportExportView) {
      this.SEExportFileset = null;
    }

    this.mode = mode;

    if (mode == Mode.AngularDiameterView) {
      this.initializeAngularDiameterCanvas();
    }
  }

  getSpaceEngineExport(): void {
    this.SEExportFileset = this.exporter.toSpaceEngine();
  }

  altInput(alt: string): void {
    var value: number = parseFloat((<HTMLInputElement>document.getElementById('alt-input-' + alt)).value);
    var c = this.selectedCelestial;

    /*
     * I sometimes forget case-switch breaks and didn't want to debug that so I'm using if-statements here
     */
    if (alt == 'SMA-AU') {
      c.SMA = this.unitConverter.convert(value, LengthUnits.AU, LengthUnits.gigameters);
      this.selectedCelestialChanged('SMA');
    }
    if (alt == 'SMA-km') {
      c.SMA = this.unitConverter.convert(value, LengthUnits.kilometers, LengthUnits.gigameters);
      this.selectedCelestialChanged('SMA');
    }
    if (alt == 'SMA-m') {
      c.SMA = this.unitConverter.convert(value, LengthUnits.meters, LengthUnits.gigameters);
      this.selectedCelestialChanged('SMA');
    }

    if (alt == 'mass-sun') {
      c.mass = this.unitConverter.convert(value, MassUnits.suns, MassUnits.earths);
      this.selectedCelestialChanged('mass');
    }
    if (alt == 'mass-jup') {
      c.mass = this.unitConverter.convert(value, MassUnits.jups, MassUnits.earths);
      this.selectedCelestialChanged('mass');
    }
    if (alt == 'mass-moon') {
      c.mass = this.unitConverter.convert(value, MassUnits.moons, MassUnits.earths);
      this.selectedCelestialChanged('mass');
    }
    if (alt == 'mass-kg') {
      c.mass = this.unitConverter.convert(value, MassUnits.kilograms, MassUnits.earths);
      this.selectedCelestialChanged('mass');
    }

    if (alt == 'radius-sun') {
      c.radius = this.unitConverter.convert(value, RadiusUnits.suns, RadiusUnits.km);
      this.selectedCelestialChanged('radius');
    }
    if (alt == 'radius-jup') {
      c.radius = this.unitConverter.convert(value, RadiusUnits.jups, RadiusUnits.km);
      this.selectedCelestialChanged('radius');
    }
    if (alt == 'radius-moon') {
      c.radius = this.unitConverter.convert(value, RadiusUnits.moons, RadiusUnits.km);
      this.selectedCelestialChanged('radius');
    }
    if (alt == 'radius-earth') {
      c.radius = this.unitConverter.convert(value, RadiusUnits.earths, RadiusUnits.km);
      this.selectedCelestialChanged('radius');
    }

    if (alt == 'greenhouse-F') {
      c.greenhouse = this.unitConverter.convertTemperatureDifference(value, TemperatureUnitTypes.fahrenheit, TemperatureUnitTypes.celsius);
      this.selectedCelestialChanged('greenhouse');
    }

  }

  template(template): void {
    if (template == 'Solar System') {
      var newCelestials = [];
      var IDMap = {};
      var parents = {};

      var solsystem = [];

      solsystem.push(new Celestial("0", "Sol", "star", "root", 0, 0, 333000, 695700, 0, 0));
      solsystem.push(new Celestial("1", "Mercury", "planet", "0", 57.91, 0.2056, 0.0553, 2439.7, .11, 0));
      solsystem.push(new Celestial("2", "Venus", "planet", "0", 108.21, 0.0067, 0.815, 6051.8, .65, 503));
      solsystem.push(new Celestial("3", "Earth", "planet", "0", 149.60, 0.0167, 1, 6371.000, .3, 33));
      solsystem[solsystem.length - 1].sidereal = 23.93447;
      solsystem.push(new Celestial("3.1", "Moon", "moon", "3", 0.3844, 0.0549, 0.0123, 1737.4, .25, 0));
      solsystem.push(new Celestial("4", "Mars", "planet", "0", 227.92, 0.0935, 0.107, 3389.5, .25, 6));

      solsystem.push(new Celestial("5", "Jupiter", "planet", "0", 778.57, 0.0489, 317.8, 69911, 0.52, 0));

      solsystem.push(new Celestial("5.1", "Io", "moon", "5", 0.422, 0.004, 0.015, 1821.5, 0.1, 0));
      solsystem.push(new Celestial("5.2", "Europa", "moon", "5", 0.671, 0.009, 0.00804, 1561, 0.1, 0));
      solsystem.push(new Celestial("5.3", "Ganymede", "moon", "5", 1.07, 0.001, 0.0248, 2631, 0.1, 0));
      solsystem.push(new Celestial("5.4", "Callisto", "moon", "5", 1.883, 0.007, 0.018, 2410.5, 0.1, 0));

      solsystem.push(new Celestial("6", "Saturn", "planet", "0", 1433.53, 0.0565, 95.16, 58232, 0.47, 0));
      solsystem.push(new Celestial("7", "Uranus", "planet", "0", 2872.46, 0.0457, 14.54, 25362, 0.51, 0));
      solsystem.push(new Celestial("8", "Neptune", "planet", "0", 4495.06, 0.0113, 17.15, 24622, 0.41, 0));

      var LAST_CELESTIAL = 'Neptune';

      parents['Sol'] = 'root';
      parents['Mercury'] = 'Sol';
      parents['Venus'] = 'Sol';
      parents['Earth'] = 'Sol';
      parents['Moon'] = 'Earth';
      parents['Mars'] = 'Sol';
      parents['Jupiter'] = 'Sol';
      parents['Io'] = 'Jupiter';
      parents['Europa'] = 'Jupiter';
      parents['Ganymede'] = 'Jupiter';
      parents['Callisto'] = 'Jupiter';
      parents['Saturn'] = 'Sol';
      parents['Uranus'] = 'Sol';
      parents['Neptune'] = 'Sol';

      IDMap['root'] = 'root';

      for (var i = 0; i < solsystem.length; i++) {
        this.systemAPI.newCelestial()
          .subscribe(res => {
            var celestial: Celestial = solsystem.splice(0, 1)[0];
            celestial._id = res._id;
            IDMap[celestial.name] = res._id;
            celestial.parent_id = IDMap[parents[celestial.name]];
            newCelestials.push(celestial);
            if (celestial.name == LAST_CELESTIAL) {
              this.activeSystem.overwriteCelestials(newCelestials);
              this.select(this.activeSystem.getAllCelestials()[0]);
            }
          }, err => {
            console.log(err);
          });
      }
    }
  }
}
