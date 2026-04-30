import { getCategoryMeta } from '../constants/categories';
import { isCurrentMonth, isCurrentWeek, isToday } from './dateFilters';

function matchesPeriod(date, period) {
  if (period === 'today') {
    return isToday(date);
  }

  if (period === 'week') {
    return isCurrentWeek(date);
  }

  return isCurrentMonth(date);
}

export function getExpenseDistribution(transactions, period) {
  const groupedExpenses = {};

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .filter((transaction) => matchesPeriod(transaction.date, period))
    .forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;
      const categoryName = transaction.category || 'Otros';

      if (!groupedExpenses[categoryName]) {
        const meta = getCategoryMeta(categoryName);

        groupedExpenses[categoryName] = {
          label: categoryName,
          value: 0,
          color: meta.color,
          icon: meta.icon,
        };
      }

      groupedExpenses[categoryName].value += amount;
    });

  const chartData = Object.values(groupedExpenses)
    .filter((item) => item.value > 0)
    .sort((firstItem, secondItem) => secondItem.value - firstItem.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return {
    chartData: chartData.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    })),
    total,
  };
}
