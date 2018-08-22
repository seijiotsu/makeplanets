import { TestBed, inject } from '@angular/core/testing';

import { PropertyUpdaterService } from './property-updater.service';

describe('PropertyUpdaterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PropertyUpdaterService]
    });
  });

  it('should be created', inject([PropertyUpdaterService], (service: PropertyUpdaterService) => {
    expect(service).toBeTruthy();
  }));
});
