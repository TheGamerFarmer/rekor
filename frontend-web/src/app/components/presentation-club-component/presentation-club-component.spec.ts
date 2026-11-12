import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentationClubComponent } from './presentation-club-component';

describe('PresentationClubComponent', () => {
  let component: PresentationClubComponent;
  let fixture: ComponentFixture<PresentationClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationClubComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PresentationClubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
