import { Injectable } from '@angular/core';
import { System } from './models/system.model';
import { Celestial } from './models/celestial.model';
import { SpaceEngineFileset } from './models/export/spaceEngineFileset';
import { ActiveSystemService } from './active-system.service';
import { UnitConverterService } from './unit-converter.service';
import { LengthUnits } from './models/units';

@Injectable({
  providedIn: 'root'
})
export class ExporterService {

  constructor(
    private activeSystem: ActiveSystemService,
    private unitConverter: UnitConverterService
  ) { }

  //Translates the active system to SE
  toSpaceEngine(): SpaceEngineFileset {
    var fileset = new SpaceEngineFileset();

    var celestials = this.activeSystem.getAllCelestials();
    for (var i = 0; i < celestials.length; i++) {
      var celestial = celestials[i];

      if (celestial.type == 'star') {
        fileset.starFile += this.translateStarToSE(celestial);
      } else {
        fileset.celestialFile += this.translateCelestialToSE(celestial);
      }
    }

    fileset.systemFilepathName = this.getSystemFilepathName(this.activeSystem.getSystem());

    return fileset;
  }

  private getSystemFilepathName(system: System): string {
    var name = system.name;
    name = name.replace(/ /g, "_");
    name = name.toLowerCase();
    return name;
  }

  private translateCelestialToSE(celestial: Celestial) {
    var translated = "";

    var type = "";
    if (celestial.type == 'planet') {
      type = "Planet";
    } else {
      type = "Moon";
    }

    translated += type + " \"" + celestial.name + "\" {\n";
    translated += "\tParentBody\t\t\"" + this.activeSystem.getParentObject(celestial).name + "\"\n";
    translated += "\tMass\t\t\t" + celestial.mass + "\n";
    translated += "\tRadius\t\t\t" + celestial.radius + "\n";
    //translated += "\tRotationPeriod\t" + celestial.sidereal + "\n";
    translated += "\tObliquity\t\t" + celestial.obliquity + "\n";

    translated += "\tOrbit {\n"
    translated += "\t\tRefPlane\t\t \"Ecliptic\"\n";
    translated += "\t\tSemiMajorAxis\t" + this.unitConverter.convert(celestial.SMA, LengthUnits.gigameters, LengthUnits.AU) + "\n";
    translated += "\t\tPeriod\t\t\t" + this.activeSystem.getDerivedProperties(celestial).orbitPeriod_years + "\n";
    translated += "\t\tEccentricity\t" + celestial.eccentricity + "\n";
    translated += "\t\tInclination\t\t" + celestial.inclination + "\n";
    translated += "\t\tAscendingNode\t" + celestial.ascendingNode + "\n";
    translated += "\t\tArgOfPericenter\t" + celestial.argOfPeriapsis + "\n";
    //translated += "\t\tMeanAnomaly\t\t" +              + "\n";
    translated += "\t}\n";
    translated += "}\n";
    return translated;
  }

  private translateStarToSE(star: Celestial) {
    var translated = "";
    translated += "Star \"" + star.name + "\" {\n";
    translated += "\tMass\t\t\t" + star.mass + "\n";
    translated += "\tRA\t\t\t\t0 0 0\n";
    translated += "\tRA\t\t\t\t0 0 0\n";
    translated += "\tDist\t\t\t" + (Math.random() * 1000 + 10) + "\n"; //TODO: Add config possibilities
    translated += "\tOrbit {\n"
    translated += "\t\tType \"Static\"\n"
    translated += "\t}\n";
    translated += "}\n";
    return translated;
  }
}
