import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategoryMeta } from '../constants/categories';
import { theme } from '../constants/theme';

function formatAmount(type, amount) {
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix} RD$ ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TransactionItem({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';
  const categoryMeta = getCategoryMeta(transaction.category);

  return (
    <View style={[styles.card, isIncome ? styles.incomeCard : styles.expenseCard]}>
      <View style={styles.row}>
        <View style={styles.categoryBlock}>
          <View style={styles.iconBadge}>
            <Text style={styles.icon}>{categoryMeta.icon}</Text>
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.description}>
            {transaction.description ? transaction.description : 'Sin descripcion'}
          </Text>
          <Text style={styles.date}>{transaction.date}</Text>
        </View>

        <View style={styles.metaContent}>
          <Text style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}>
            {formatAmount(transaction.type, transaction.amount)}
          </Text>
          <Text style={[styles.typeBadge, isIncome ? styles.incomeBadge : styles.expenseBadge]}>
            {isIncome ? 'Ingreso' : 'Gasto'}
          </Text>
        </View>
      </View>

      <Pressable onPress={() => onDelete(transaction.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
  },
  incomeCard: {
    borderColor: '#14532D',
  },
  expenseCard: {
    borderColor: '#4C1D1D',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  categoryBlock: {
    marginRight: theme.spacing.xs,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  textContent: {
    flex: 1,
  },
  metaContent: {
    alignItems: 'flex-end',
  },
  category: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  amount: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  incomeText: {
    color: theme.colors.income,
  },
  expenseText: {
    color: theme.colors.danger,
  },
  typeBadge: {
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  incomeBadge: {
    backgroundColor: '#052E16',
    color: theme.colors.income,
  },
  expenseBadge: {
    backgroundColor: '#3B0B0B',
    color: theme.colors.danger,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: '#2A1113',
  },
  deleteText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
});
