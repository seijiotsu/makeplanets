import { TestBed, inject } from '@angular/core/testing';

import { ActiveSystemService } from './active-system.service';

describe('ActiveSystemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActiveSystemService]
    });
  });

  it('should be created', inject([ActiveSystemService], (service: ActiveSystemService) => {
    expect(service).toBeTruthy();
  }));
});
