import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentInscription } from './component-inscription';
import { provideRouter } from '@angular/router';

describe('ComponentInscription', () => {
  let component: ComponentInscription;
  let fixture: ComponentFixture<ComponentInscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentInscription],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentInscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
