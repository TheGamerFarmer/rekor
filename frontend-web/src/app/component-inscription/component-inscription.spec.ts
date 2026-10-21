import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentInscription } from './component-inscription';

describe('ComponentInscription', () => {
  let component: ComponentInscription;
  let fixture: ComponentFixture<ComponentInscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentInscription],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentInscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
