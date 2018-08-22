import { TestBed, inject } from '@angular/core/testing';

import { CelestialService } from './celestial.service';

describe('CelestialService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CelestialService]
    });
  });

  it('should be created', inject([CelestialService], (service: CelestialService) => {
    expect(service).toBeTruthy();
  }));
});
