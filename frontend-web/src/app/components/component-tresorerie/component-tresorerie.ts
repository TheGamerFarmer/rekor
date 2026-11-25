import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../component-banner/banner';
import {
  toBankOperation,
  toTreasuryTransaction,
  type TransactionType,
  type TreasuryTransaction,
} from './treasury-transaction';

registerLocaleData(localeFr);

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_TRANSACTIONS: TreasuryTransaction[] = [
  {
    id: 1,
    type: 'income',
    date: '2026-12-12',
    category: 'Adhésion',
    description: 'Adhésions membres',
    amount: 450,
  },
  {
    id: 2,
    type: 'income',
    date: '2026-10-05',
    category: 'Subvention',
    description: 'Subvention mairie',
    amount: 1000,
  },
  {
    id: 3,
    type: 'income',
    date: '2026-09-20',
    category: 'Don',
    description: 'Don particulier',
    amount: 100,
  },
  {
    id: 4,
    type: 'income',
    date: '2026-08-15',
    category: 'Adhésion',
    description: 'Adhésions saison',
    amount: 900,
  },
  {
    id: 5,
    type: 'expense',
    date: '2026-12-10',
    category: 'Matériel',
    description: 'Filets',
    amount: 300,
  },
  {
    id: 6,
    type: 'expense',
    date: '2026-11-01',
    category: 'Nourriture/ Boisson',
    description: 'Goûter tournoi',
    amount: 120,
  },
  {
    id: 7,
    type: 'expense',
    date: '2026-10-15',
    category: 'Service',
    description: 'Location gymnase',
    amount: 250,
  },
  {
    id: 8,
    type: 'expense',
    date: '2026-09-15',
    category: 'Matériel',
    description: 'Ballons',
    amount: 1310,
  },
];

@Component({
  imports: [Banner, CurrencyPipe, DatePipe, ReactiveFormsModule],
  selector: 'app-component-tresorerie',
  templateUrl: './component-tresorerie.html',
  styleUrl: './component-tresorerie.css',
})
export class ComponentTresorerie {
  protected readonly year = signal(CURRENT_YEAR);
  private readonly operations = signal(INITIAL_TRANSACTIONS.map(toBankOperation));
  private readonly attachments = signal(new Map<number, File>());
  protected readonly transactions = computed(() =>
    this.operations()
      .map(toTreasuryTransaction)
      .map((transaction) => ({
        ...transaction,
        document: this.attachments().get(transaction.id),
      })),
  );
  protected readonly showAllIncome = signal(false);
  protected readonly showAllExpenses = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly years = Array.from({ length: 10 }, (_, index) => CURRENT_YEAR - index);
  protected readonly incomeCategories = ['Adhésion', 'Subvention', 'Don', 'Autre'];
  protected readonly expenseCategories = ['Matériel', 'Nourriture/ Boisson', 'Service', 'Autre'];

  protected readonly incomes = computed(() =>
    this.transactions()
      .filter((transaction) => transaction.type === 'income' && this.inYear(transaction))
      .sort((a, b) => b.date.localeCompare(a.date)),
  );
  protected readonly expenses = computed(() =>
    this.transactions()
      .filter((transaction) => transaction.type === 'expense' && this.inYear(transaction))
      .sort((a, b) => b.date.localeCompare(a.date)),
  );
  protected readonly totalIncome = computed(() =>
    this.incomes().reduce((total, transaction) => total + transaction.amount, 0),
  );
  protected readonly totalExpenses = computed(() =>
    this.expenses().reduce((total, transaction) => total + transaction.amount, 0),
  );
  protected readonly balance = computed(() => this.totalIncome() - this.totalExpenses());
  protected readonly visibleIncomes = computed(() =>
    this.showAllIncome() ? this.incomes() : this.incomes().slice(0, 3),
  );
  protected readonly visibleExpenses = computed(() =>
    this.showAllExpenses() ? this.expenses() : this.expenses().slice(0, 3),
  );

  protected readonly incomeForm = new FormBuilder().nonNullable.group({
    date: [this.dateForYear(CURRENT_YEAR), Validators.required],
    category: ['Adhésion', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
    document: [null as File | null],
  });
  protected readonly expenseForm = new FormBuilder().nonNullable.group({
    date: [this.dateForYear(CURRENT_YEAR), Validators.required],
    category: ['Matériel', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
    document: [null as File | null],
  });
  private nextId = Math.max(...INITIAL_TRANSACTIONS.map((transaction) => transaction.id)) + 1;

  /** Changes the selected year and updates forms that still use their default date. */
  protected onYearChange(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) {
      const previousDefaultDate = this.dateForYear(this.year());
      this.year.set(Number(select.value));
      const nextDefaultDate = this.dateForYear(this.year());
      for (const form of [this.incomeForm, this.expenseForm]) {
        if (form.controls.date.value === previousDefaultDate) {
          form.controls.date.setValue(nextDefaultDate);
        }
      }
      this.showAllIncome.set(false);
      this.showAllExpenses.set(false);
    }
  }

  /** Stores an optional supporting document selected for an income or expense. */
  protected onDocumentChange(type: TransactionType, event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement && input.type === 'file') {
      const form = type === 'income' ? this.incomeForm : this.expenseForm;
      form.controls.document.setValue(input.files?.[0] ?? null);
    }
  }

  /** Validates and adds a transaction to the selected year's balance. */
  protected addTransaction(type: TransactionType): void {
    const form = type === 'income' ? this.incomeForm : this.expenseForm;
    if (form.invalid) {
      form.markAllAsTouched();
      this.statusMessage.set(
        'Veuillez saisir une date, une catégorie et un montant supérieur à zéro.',
      );
      return;
    }

    const values = form.getRawValue();
    const transaction: TreasuryTransaction = {
      id: this.nextId++,
      type,
      date: values.date,
      category: values.category,
      description: values.description.trim(),
      amount: Number(values.amount),
    };

    this.operations.update((operations) => [toBankOperation(transaction), ...operations]);
    form.reset({
      date: this.dateForYear(this.year()),
      category: type === 'income' ? 'Adhésion' : 'Matériel',
      amount: null,
      description: '',
      document: null,
    });
    const attachedDocument = values.document;
    if (attachedDocument) {
      this.attachments.update((attachments) =>
        new Map(attachments).set(transaction.id, attachedDocument),
      );
    }
    this.statusMessage.set(
      type === 'income' ? 'Recette ajoutée au bilan.' : 'Dépense ajoutée au bilan.',
    );
  }

  /** Downloads the supporting document attached to a transaction. */
  protected downloadDocument(transaction: TreasuryTransaction): void {
    if (!transaction.document) {
      return;
    }

    const url = URL.createObjectURL(transaction.document);
    const link = document.createElement('a');
    link.href = url;
    link.download = transaction.document.name;
    link.click();
    URL.revokeObjectURL(url);
    this.statusMessage.set(`Document ${transaction.document.name} téléchargé.`);
  }

  /** Downloads the selected year's income and expense summary as a CSV file. */
  protected exportBalance(): void {
    const header = ['Date', 'Type', 'Catégorie', 'Description', 'Montant (€)'];
    const transactionRows = (transactions: TreasuryTransaction[]) =>
      [...transactions]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((transaction) => [
          transaction.date,
          transaction.type === 'income' ? 'Recette' : 'Dépense',
          transaction.category,
          transaction.description,
          transaction.amount.toFixed(2),
        ]);
    const rows = [
      ['Recettes'],
      header,
      ...transactionRows(this.incomes()),
      ['Total des recettes', '', '', '', this.totalIncome().toFixed(2)],
      [],
      ['Dépenses'],
      header,
      ...transactionRows(this.expenses()),
      ['Total des dépenses', '', '', '', this.totalExpenses().toFixed(2)],
      [],
      ["Solde de l'année", '', '', '', this.balance().toFixed(2)],
    ];
    const csv = rows.map((row) => row.map((cell) => this.escapeCsv(cell)).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bilan-tresorerie-${this.year()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.statusMessage.set(`Bilan ${this.year()} exporté.`);
  }

  /** Toggles whether all income transactions are displayed. */
  protected toggleIncomeHistory(): void {
    this.showAllIncome.update((showAll) => !showAll);
  }

  /** Toggles whether all expense transactions are displayed. */
  protected toggleExpenseHistory(): void {
    this.showAllExpenses.update((showAll) => !showAll);
  }

  /** Checks whether a transaction belongs to the selected year. */
  private inYear(transaction: TreasuryTransaction): boolean {
    return Number(transaction.date.slice(0, 4)) === this.year();
  }

  /** Formats a date as the local YYYY-MM-DD value used by date inputs. */
  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  /** Returns the current calendar date expressed in the requested year. */
  private dateForYear(year: number): string {
    const now = new Date();
    return this.formatDate(new Date(year, now.getMonth(), now.getDate()));
  }

  /** Escapes a CSV cell and wraps it in quotes. */
  private escapeCsv(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }
}
