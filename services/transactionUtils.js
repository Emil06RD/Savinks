import { isCurrentMonth } from '../utils/dateFilters';

export function getSummary(transactions) {
  let income = 0;
  let expenses = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;

    if (transaction.type === 'income') {
      income += amount;

      if (isCurrentMonth(transaction.date)) {
        monthlyIncome += amount;
      }
    } else {
      expenses += amount;

      if (isCurrentMonth(transaction.date)) {
        monthlyExpenses += amount;
      }
    }
  });

  return {
    balance: income - expenses,
    income,
    expenses,
    monthlyIncome,
    monthlyExpenses,
    monthlyNet: monthlyIncome - monthlyExpenses,
    transactionCount: transactions.length,
  };
}
