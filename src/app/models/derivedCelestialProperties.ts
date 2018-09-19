export class DerivedCelestialProperties {
  _id: string; //The ID of the celestial whose properties we are retrieving
  SMA_AU: number;
  SMA_kilometers: number;
  SMA_meters: number;

  apoapsis_kilometers: number;
  apoapsis_gigameters: number;
  apoapsis_AU: number;

  periapsis_kilometers: number; 
  periapsis_gigameters: number;
  periapsis_AU: number;

  orbitPeriod_concat: string;
  orbitPeriod_years: number;
  orbitPeriod_days: number;
  orbitPeriod_hours: number;
  orbitPeriod_minutes: number;
  orbitPeriod_seconds: number;
  orbitPeriod_localDays: number;

  sidereal_concat: string;
  sidereal_years: number;
  sidereal_days: number;
  sidereal_hours: number;
  sidereal_minutes: number;
  sidereal_seconds: number;

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

  rocheLimit_AU: number;
  rocheLimit_Gm: number;
  rocheLimit_km: number;
  rocheLimit_m: number;

  surfaceTemperature_K: number;
  surfaceTemperature_F: number;
  surfaceTemperature_C: number;

  tidalLockTime: number;

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

  SMAA_AU: number;
  SMAA_gigameters: number;
  SMAA_kilometers: number;
  SMAA_meters: number;

  SMAB_AU: number;
  SMAB_gigameters: number;
  SMAB_kilometers: number;
  SMAB_meters: number;

  apoapsisAB_kilometers: number;
  apoapsisAB_gigameters: number;
  apoapsisAB_AU: number;

  periapsisAB_kilometers: number;
  periapsisAB_gigameters: number;
  periapsisAB_AU: number;

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

  binaryOrbitPeriod_concat: string;
  binaryOrbitPeriod_years: number;
  binaryOrbitPeriod_days: number;
  binaryOrbitPeriod_hours: number;
  binaryOrbitPeriod_minutes: number;
  binaryOrbitPeriod_seconds: number;
  binaryOrbitPeriod_localDaysA: number;
  binaryOrbitPeriod_localDaysB: number;

  siderealA_concat: string;
  siderealA_years: number;
  siderealA_days: number;
  siderealA_hours: number;
  siderealA_minutes: number;
  siderealA_seconds: number;
  siderealB_concat: string;
  siderealB_years: number;
  siderealB_days: number;
  siderealB_hours: number;
  siderealB_minutes: number;
  siderealB_seconds: number;

  rocheLimitA_AU: number;
  rocheLimitA_Gm: number;
  rocheLimitA_km: number;
  rocheLimitA_m: number;
  rocheLimitB_AU: number;
  rocheLimitB_Gm: number;
  rocheLimitB_km: number;
  rocheLimitB_m: number;

  orbitPeriod_localDaysA: number;
  orbitPeriod_localDaysB: number;
}
