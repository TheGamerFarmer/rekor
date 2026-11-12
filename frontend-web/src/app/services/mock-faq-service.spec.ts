import { TestBed } from '@angular/core/testing';
import { MockFaqService } from './mock-faq-service';

describe('MockFaqService', () => {
  let service: MockFaqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockFaqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
