import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  function createApp() {
    const fixture = TestBed.createComponent(App);
    return { fixture };
  }

  it('should create the app', () => {
    const { fixture } = createApp();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the club name', async () => {
    const { fixture } = createApp();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.club-name')?.textContent).toContain('Gières Volley-Ball');
  });
});
