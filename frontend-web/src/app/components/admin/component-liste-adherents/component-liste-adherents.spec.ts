import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentListeAdherents } from './component-liste-adherents';

describe('ComponentListeAdherents', () => {
  let component: ComponentListeAdherents;
  let fixture: ComponentFixture<ComponentListeAdherents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentListeAdherents],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentListeAdherents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
