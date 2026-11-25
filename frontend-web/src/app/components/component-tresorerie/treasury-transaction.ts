export type TransactionType = 'income' | 'expense';

export interface TreasuryTransaction {
  id: number;
  type: TransactionType;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface BankOperation {
  id: number;
  amount: number;
  comment: string;
  date: string;
}

export function toBankOperation(transaction: TreasuryTransaction): BankOperation {
  return {
    id: transaction.id,
    amount: transaction.amount,
    date: transaction.date,
    comment: JSON.stringify({
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
    }),
  };
}

export function toTreasuryTransaction(operation: BankOperation): TreasuryTransaction {
  const comment: unknown = JSON.parse(operation.comment);
  if (!comment || typeof comment !== 'object') {
    throw new Error('Commentaire de trésorerie invalide.');
  }

  const fields = comment as Record<string, unknown>;
  if (
    (fields['type'] !== 'income' && fields['type'] !== 'expense') ||
    typeof fields['category'] !== 'string' ||
    typeof fields['description'] !== 'string'
  ) {
    throw new Error('Commentaire de trésorerie invalide.');
  }

  return {
    id: operation.id,
    amount: operation.amount,
    date: operation.date,
    type: fields['type'],
    category: fields['category'],
    description: fields['description'],
  };
}
