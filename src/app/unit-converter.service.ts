import { Injectable } from '@angular/core';
import { TemperatureUnitTypes } from './models/units';
import { Constants } from './models/constants';

@Injectable({
  providedIn: 'root'
})
export class UnitConverterService {

  constructor() { }

  convert(scalar: number, from: number, to: number): number {
    return scalar * from / to;
  }

  convertTemperature(temperature: number, from: TemperatureUnitTypes, to: TemperatureUnitTypes): number {
    if (to == from) return temperature;
    var temp_C;

    if (from == TemperatureUnitTypes.fahrenheit) {
      temp_C = (temperature - 32) * (5.0 / 9);
    } else if (from == TemperatureUnitTypes.celsius) {
      temp_C = temperature;
    } else if (from == TemperatureUnitTypes.kelvin) {
      temp_C = temperature - Constants.Zero_Celsius_in_Kelvin;
    }

    if (to == TemperatureUnitTypes.celsius) {
      return temp_C;
    } else if (to == TemperatureUnitTypes.fahrenheit) {
      return temp_C * 9.0 / 5 + 32;
    } else if (to == TemperatureUnitTypes.kelvin) {
      return temp_C + Constants.Zero_Celsius_in_Kelvin;
    }

    return null;
  }

  //E.g. how much is a change in 5C in fahrenheit
  convertTemperatureDifference(temperature: number, from: TemperatureUnitTypes, to: TemperatureUnitTypes): number {
    if (to == from) return temperature;
    var temp_C;

    if (from == TemperatureUnitTypes.fahrenheit) {
      temp_C = temperature * (5.0 / 9);
    } else if (from == TemperatureUnitTypes.celsius) {
      temp_C = temperature;
    } else if (from == TemperatureUnitTypes.kelvin) {
      temp_C = temperature;
    }

    if (to == TemperatureUnitTypes.celsius) {
      return temp_C;
    } else if (to == TemperatureUnitTypes.fahrenheit) {
      return temp_C * 9.0 / 5;
    } else if (to == TemperatureUnitTypes.kelvin) {
      return temp_C + Constants.Zero_Celsius_in_Kelvin;
    }
  }

  fahrenheitToCelsius(temperature: number): number {
    return (temperature - 32) * (5.0 / 9);
  }
  celsiusToFahrenheit(temperature: number): number {
    return temperature * 9.0 / 5 + 32;
  }
}
