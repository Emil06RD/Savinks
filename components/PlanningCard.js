import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategoryMeta } from '../constants/categories';
import { theme } from '../constants/theme';
import { isPastDate, isToday } from '../utils/dateUtils';
import StatusBadge from './StatusBadge';

function formatAmount(amount) {
  return `RD$ ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PlanningCard({
  plannedExpense,
  onDelete,
  onMarkAsPaid,
  isProcessing = false,
}) {
  const categoryMeta = getCategoryMeta(plannedExpense.category);
  const isPending = plannedExpense.status === 'pending';
  const isOverdue =
    isPending && isPastDate(plannedExpense.dueDate) && !isToday(plannedExpense.dueDate);

  return (
    <View
      style={[
        styles.card,
        isOverdue && styles.overdueCard,
        plannedExpense.status === 'paid' && styles.paidCard,
        plannedExpense.status === 'cancelled' && styles.cancelledCard,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, isOverdue && styles.overdueIconBadge]}>
            <Text style={styles.icon}>{categoryMeta.icon}</Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>{plannedExpense.title}</Text>
            <Text style={styles.category}>{plannedExpense.category}</Text>
          </View>
        </View>

        <StatusBadge isOverdue={isOverdue} status={plannedExpense.status} />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Monto</Text>
          <Text style={styles.amount}>{formatAmount(plannedExpense.amount)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Vence</Text>
          <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
            {plannedExpense.dueDate}
          </Text>
        </View>
      </View>

      {plannedExpense.notes ? (
        <View style={styles.notesBlock}>
          <Text style={styles.detailLabel}>Notas</Text>
          <Text style={styles.notes}>{plannedExpense.notes}</Text>
        </View>
      ) : null}

      {plannedExpense.reminder ? (
        <Text style={styles.reminderText}>Recordatorio activado</Text>
      ) : null}

      <View style={styles.actionsRow}>
        {isPending ? (
          <Pressable
            disabled={isProcessing}
            onPress={() => onMarkAsPaid(plannedExpense.id)}
            style={[styles.actionButton, styles.payButton, isProcessing && styles.disabledButton]}
          >
            <Text style={styles.payButtonText}>
              {isProcessing ? 'Procesando...' : 'Marcar como pagado'}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          disabled={isProcessing}
          onPress={() => onDelete(plannedExpense.id)}
          style={[
            styles.actionButton,
            styles.deleteButton,
            !isPending && styles.fullWidthButton,
            isProcessing && styles.disabledButton,
          ]}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  overdueCard: {
    borderColor: '#7F1D1D',
    backgroundColor: '#1D1214',
  },
  paidCard: {
    borderColor: '#14532D',
  },
  cancelledCard: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  overdueIconBadge: {
    backgroundColor: '#311514',
    borderColor: '#7F1D1D',
  },
  icon: {
    fontSize: 22,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  category: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  amount: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  overdueText: {
    color: '#FDBA74',
  },
  notesBlock: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notes: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  reminderText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.sm,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
  },
  payButtonText: {
    color: '#052E16',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#2A1113',
    borderWidth: 1,
    borderColor: '#4C1D1D',
  },
  deleteButtonText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  fullWidthButton: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
