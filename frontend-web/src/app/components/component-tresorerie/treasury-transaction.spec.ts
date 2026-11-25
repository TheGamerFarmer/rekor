import {
  toBankOperation,
  toTreasuryTransaction,
  type TreasuryTransaction,
} from './treasury-transaction';

describe('treasury transaction mapping', () => {
  it.each(['income', 'expense'] as const)(
    'keeps the %s type, category and description in the comment',
    (type) => {
      const transaction: TreasuryTransaction = {
        id: 1,
        type,
        date: '2026-11-25',
        category: 'Autre',
        description: 'Un "don" ; avec retour\nà la ligne',
        amount: 25.5,
      };

      const operation = toBankOperation(transaction);

      expect(Object.keys(operation).sort()).toEqual(['amount', 'comment', 'date', 'id']);
      expect(JSON.parse(operation.comment)).toEqual({
        type,
        category: transaction.category,
        description: transaction.description,
      });
      expect(toTreasuryTransaction(operation)).toEqual(transaction);
    },
  );

  it('rejects comments without the required treasury fields', () => {
    expect(() =>
      toTreasuryTransaction({ id: 1, date: '2026-11-25', amount: 1, comment: '{}' }),
    ).toThrow('Commentaire de trésorerie invalide.');
  });
});
