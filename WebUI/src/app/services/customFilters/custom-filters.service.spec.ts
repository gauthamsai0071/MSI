import { TestBed } from '@angular/core/testing';

import { CustomFiltersService } from './custom-filters.service';

describe('CustomFiltersService', () => {
  let service: CustomFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
