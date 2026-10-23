import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccueilClubComponent } from './accueil-club-component';

describe('AccueilClubComponent', () => {
  let component: AccueilClubComponent;
  let fixture: ComponentFixture<AccueilClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccueilClubComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccueilClubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
