import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ComponentCompte } from './component-compte';

describe('ComponentCompte', () => {
  let component: ComponentCompte;
  let fixture: ComponentFixture<ComponentCompte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCompte],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCompte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
