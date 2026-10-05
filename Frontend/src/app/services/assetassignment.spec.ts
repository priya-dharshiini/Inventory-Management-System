import { TestBed } from '@angular/core/testing';
import { Assetassignment } from './assetassignment';

describe('Assetassignment', () => {
  let service: Assetassignment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Assetassignment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
