import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFaq } from './component-faq';

describe('ComponentFaq', () => {
  let component: ComponentFaq;
  let fixture: ComponentFixture<ComponentFaq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentFaq],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentFaq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
