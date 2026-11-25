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
    (
      fixture.nativeElement.querySelectorAll('.history-card button')[1] as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(component['totalIncome']()).toBe(2500);
    expect(component['totalExpenses']()).toBe(2005);
    expect(component['balance']()).toBe(495);
    expect(fixture.nativeElement.textContent).toContain('Don du tournoi');
    expect(fixture.nativeElement.textContent).toContain('Ballon');
    expect(
      component['incomes']().find(({ description }) => description === 'Don du tournoi')?.date,
    ).toBe('2026-10-10');
    expect(component['expenses']().find(({ description }) => description === 'Ballon')?.date).toBe(
      '2026-10-11',
    );
    expect(
      component['operations']()
        .slice(0, 2)
        .map((operation) => JSON.parse(operation.comment)),
    ).toEqual([
      { type: 'expense', category: 'Matériel', description: 'Ballon' },
      { type: 'income', category: 'Don', description: 'Don du tournoi' },
    ]);
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

  it('exports separate income and expense tables with totals as a CSV file', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:treasury');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    fixture.nativeElement.querySelector('.export-button').click();

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    expect(csv.replace(/^\uFEFF/, '')).toBe(
      [
        '"Recettes"',
        '"Date";"Type";"Catégorie";"Description";"Montant (€)"',
        '"2026-08-15";"Recette";"Adhésion";"Adhésions saison";"900.00"',
        '"2026-09-20";"Recette";"Don";"Don particulier";"100.00"',
        '"2026-10-05";"Recette";"Subvention";"Subvention mairie";"1000.00"',
        '"2026-12-12";"Recette";"Adhésion";"Adhésions membres";"450.00"',
        '"Total des recettes";"";"";"";"2450.00"',
        '',
        '"Dépenses"',
        '"Date";"Type";"Catégorie";"Description";"Montant (€)"',
        '"2026-09-15";"Dépense";"Matériel";"Ballons";"1310.00"',
        '"2026-10-15";"Dépense";"Service";"Location gymnase";"250.00"',
        '"2026-11-01";"Dépense";"Nourriture/ Boisson";"Goûter tournoi";"120.00"',
        '"2026-12-10";"Dépense";"Matériel";"Filets";"300.00"',
        '"Total des dépenses";"";"";"";"1980.00"',
        '',
        '"Solde de l\'année";"";"";"";"470.00"',
      ].join('\r\n'),
    );
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:treasury');
    expect(fixture.componentInstance['statusMessage']()).toContain('Bilan 2026 exporté');

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });

  it('exports empty tables for a year without transactions', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:treasury');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const select = fixture.nativeElement.querySelector(
      '[aria-label="Année du bilan"]',
    ) as HTMLSelectElement;
    select.value = '2025';
    select.dispatchEvent(new Event('change'));

    fixture.nativeElement.querySelector('.export-button').click();

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    expect(csv.replace(/^\uFEFF/, '')).toBe(
      [
        '"Recettes"',
        '"Date";"Type";"Catégorie";"Description";"Montant (€)"',
        '"Total des recettes";"";"";"";"0.00"',
        '',
        '"Dépenses"',
        '"Date";"Type";"Catégorie";"Description";"Montant (€)"',
        '"Total des dépenses";"";"";"";"0.00"',
        '',
        '"Solde de l\'année";"";"";"";"0.00"',
      ].join('\r\n'),
    );
    expect(fixture.componentInstance['statusMessage']()).toContain('Bilan 2025 exporté');

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });
});
