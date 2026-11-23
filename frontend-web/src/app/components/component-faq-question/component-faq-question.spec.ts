import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFaqQuestion } from './component-faq-question';

describe('ComponentFaqQuestion', () => {
  let component: ComponentFaqQuestion;
  let fixture: ComponentFixture<ComponentFaqQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentFaqQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFaqQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
