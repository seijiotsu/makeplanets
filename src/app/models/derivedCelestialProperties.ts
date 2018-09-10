export class DerivedCelestialProperties {
  _id: string; //The ID of the celestial whose properties we are retrieving
  SMA_AU: number;
  SMA_kilometers: number;
  SMA_meters: number;

  apoapsis_kilometers: number;
  apoapsis_AU: number;

  periapsis_kilometers: number;
  periapsis_AU: number;

  orbitPeriod_concat: string;
  orbitPeriod_years: number;
  orbitPeriod_days: number;
  orbitPeriod_hours: number;
  orbitPeriod_minutes: number;
  orbitPeriod_seconds: number;
  orbitPeriod_localDays: number;

  mass_sun: number;
  mass_jup: number;
  mass_moon: number;
  mass_kg: number;

  radius_sun: number;
  radius_jup: number;
  radius_earth: number;
  radius_moon: number;

  density_gcm3: number;
  density_kgm3: number;
  density_earth: number;

  gravity_ms2: number;
  gravity_g: number;

  hillSphere_AU: number;
  hillSphere_Gm: number;
  hillSphere_km: number;

  surfaceTemperature_K: number;
  surfaceTemperature_F: number;
  surfaceTemperature_C: number;

  //FOR PLANETS AND MOONS ONLY
  insolation_W: number;
  insolation_earths: number;

  greenhouse_C: number;
  greenhouse_F: number;

  //FOR STARS AND BROWN DWARVES ONLY
  luminosity_sun: number;
  luminosity_W: number; //watts

  //FOR BINARY PLANETS ONLY
  SMAAB_AU: number;
  SMAAB_kilometers: number;
  SMAAB_meters: number;

  massA_sun: number;
  massA_jup: number;
  massA_moon: number;
  massA_kg: number;

  radiusA_sun: number;
  radiusA_jup: number;
  radiusA_earth: number;
  radiusA_moon: number;

  densityA_gcm3: number;
  densityA_kgm3: number;
  densityA_earth: number;

  gravityA_ms2: number;
  gravityA_g: number;

  massB_sun: number;
  massB_jup: number;
  massB_moon: number;
  massB_kg: number;

  radiusB_sun: number;
  radiusB_jup: number;
  radiusB_earth: number;
  radiusB_moon: number;

  densityB_gcm3: number;
  densityB_kgm3: number;
  densityB_earth: number;

  gravityB_ms2: number;
  gravityB_g: number;

  surfaceTemperatureA_K: number;
  surfaceTemperatureA_F: number;
  surfaceTemperatureA_C: number;
  surfaceTemperatureB_K: number;
  surfaceTemperatureB_F: number;
  surfaceTemperatureB_C: number;

  greenhouseA_C: number;
  greenhouseA_F: number;
  greenhouseB_C: number;
  greenhouseB_F: number;
}
