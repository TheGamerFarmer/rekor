import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../component-banner/banner';

registerLocaleData(localeFr);

const CURRENT_YEAR = new Date().getFullYear();

type TransactionType = 'income' | 'expense';

interface TreasuryTransaction {
  id: number;
  type: TransactionType;
  date: string;
  category: string;
  description: string;
  amount: number;
}

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
    category: 'Nourriture',
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
  protected readonly transactions = signal(INITIAL_TRANSACTIONS);
  protected readonly showAllIncome = signal(false);
  protected readonly showAllExpenses = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly years = Array.from({ length: 6 }, (_, index) => CURRENT_YEAR - index);
  protected readonly incomeCategories = ['Adhésion', 'Subvention', 'Don', 'Autre'];
  protected readonly expenseCategories = [
    'Matériel',
    'Nourriture',
    'Service',
    'Déplacement',
    'Autre',
  ];

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
    category: ['Adhésion', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
  });
  protected readonly expenseForm = new FormBuilder().nonNullable.group({
    category: ['Matériel', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
  });
  private nextId = Math.max(...INITIAL_TRANSACTIONS.map((transaction) => transaction.id)) + 1;

  protected onYearChange(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) {
      this.year.set(Number(select.value));
      this.showAllIncome.set(false);
      this.showAllExpenses.set(false);
    }
  }

  protected addTransaction(type: TransactionType): void {
    const form = type === 'income' ? this.incomeForm : this.expenseForm;
    if (form.invalid) {
      form.markAllAsTouched();
      this.statusMessage.set('Veuillez saisir une catégorie et un montant supérieur à zéro.');
      return;
    }

    const values = form.getRawValue();
    const now = new Date();
    const date =
      this.year() === now.getFullYear()
        ? this.formatDate(now)
        : `${this.year()}-${this.formatDate(now).slice(5)}`;
    const transaction: TreasuryTransaction = {
      id: this.nextId++,
      type,
      date,
      category: values.category,
      description: values.description.trim(),
      amount: Number(values.amount),
    };

    this.transactions.update((transactions) => [transaction, ...transactions]);
    form.reset({
      category: type === 'income' ? 'Adhésion' : 'Matériel',
      amount: null,
      description: '',
    });
    this.statusMessage.set(
      type === 'income' ? 'Recette ajoutée au bilan.' : 'Dépense ajoutée au bilan.',
    );
  }

  protected exportBalance(): void {
    const rows = [
      ['Date', 'Type', 'Catégorie', 'Description', 'Montant (€)'],
      ...[...this.incomes(), ...this.expenses()]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((transaction) => [
          transaction.date,
          transaction.type === 'income' ? 'Recette' : 'Dépense',
          transaction.category,
          transaction.description,
          transaction.amount.toFixed(2),
        ]),
      [],
      ['Total des recettes', '', '', '', this.totalIncome().toFixed(2)],
      ['Total des dépenses', '', '', '', this.totalExpenses().toFixed(2)],
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

  protected toggleIncomeHistory(): void {
    this.showAllIncome.update((showAll) => !showAll);
  }

  protected toggleExpenseHistory(): void {
    this.showAllExpenses.update((showAll) => !showAll);
  }

  private inYear(transaction: TreasuryTransaction): boolean {
    return Number(transaction.date.slice(0, 4)) === this.year();
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private escapeCsv(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }
}
