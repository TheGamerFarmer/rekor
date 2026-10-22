import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentConnexion } from './component-connexion';
import { provideRouter } from '@angular/router';

describe('ComponentConnexion', () => {
  let component: ComponentConnexion;
  let fixture: ComponentFixture<ComponentConnexion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentConnexion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentConnexion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
