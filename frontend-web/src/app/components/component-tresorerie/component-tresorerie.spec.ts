import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentTresorerie } from './component-tresorerie';

describe('ComponentTresorerie', () => {
  let fixture: ComponentFixture<ComponentTresorerie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTresorerie],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentTresorerie);
    fixture.detectChanges();
  });

  it('displays the annual totals and recent transaction history', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('Trésorerie');
    expect(page.textContent).toContain('2 450 €');
    expect(page.textContent).toContain('1 980 €');
    expect(page.textContent).toContain('470 €');
    expect(page.querySelectorAll('.history-card tbody tr')).toHaveLength(6);
    expect(page.querySelectorAll('input[type="date"]')).toHaveLength(2);
    expect(page.textContent).toContain('Nourriture/ Boisson');
    const expenseOptions = Array.from(
      page.querySelectorAll('.entry-form select')[1].querySelectorAll('option'),
    ).map((option) => option.textContent);
    expect(expenseOptions).not.toContain('Déplacement');
  });

  it('adds income and expense entries and recalculates the balance', () => {
    const component = fixture.componentInstance;
    component['incomeForm'].setValue({
      date: '2026-10-10',
      category: 'Don',
      amount: 50,
      description: 'Don du tournoi',
    });
    (
      fixture.nativeElement.querySelector('.entry-form button[type="submit"]') as HTMLButtonElement
    ).click();
    component['expenseForm'].setValue({
      date: '2026-10-11',
      category: 'Matériel',
      amount: 25,
      description: 'Ballon',
    });
    (
      fixture.nativeElement.querySelectorAll(
        '.entry-form button[type="submit"]',
      )[1] as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(component['totalIncome']()).toBe(2500);
    expect(component['totalExpenses']()).toBe(2005);
    expect(component['balance']()).toBe(495);
    expect(fixture.nativeElement.textContent).toContain('Don du tournoi');
    expect(fixture.nativeElement.textContent).toContain('Ballon');
    expect(component['incomes']()[0].date).toBe('2026-10-10');
    expect(component['expenses']()[0].date).toBe('2026-10-11');
  });

  it('rejects invalid transaction amounts', () => {
    const component = fixture.componentInstance;
    component['incomeForm'].setValue({
      date: '2026-11-24',
      category: 'Don',
      amount: 0,
      description: '',
    });
    (
      fixture.nativeElement.querySelector('.entry-form button[type="submit"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(component['totalIncome']()).toBe(2450);
    expect(component['statusMessage']()).toContain('supérieur à zéro');
  });

  it('filters the balance by year and toggles longer histories', () => {
    const component = fixture.componentInstance;
    const select = fixture.nativeElement.querySelector(
      '[aria-label="Année du bilan"]',
    ) as HTMLSelectElement;
    select.value = '2025';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component['totalIncome']()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Aucune recette pour 2025.');

    select.value = '2026';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const historyToggles = fixture.nativeElement.querySelectorAll(
      '.history-card button',
    ) as NodeListOf<HTMLButtonElement>;
    historyToggles[0].click();
    historyToggles[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.history-card tbody tr')).toHaveLength(8);
    expect(fixture.nativeElement.querySelectorAll('.history-card button')).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Voir moins');

    historyToggles[0].click();
    historyToggles[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.history-card tbody tr')).toHaveLength(6);
    expect(fixture.nativeElement.textContent).toContain('Voir plus');
  });

  it('exports the selected year as a CSV file', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:treasury');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    fixture.nativeElement.querySelector('.export-button').click();

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:treasury');
    expect(fixture.componentInstance['statusMessage']()).toContain('Bilan 2026 exporté');

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });
});
