import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentClub } from './component-club';

describe('ComponentClub', () => {
  let component: ComponentClub;
  let fixture: ComponentFixture<ComponentClub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentClub],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentClub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
