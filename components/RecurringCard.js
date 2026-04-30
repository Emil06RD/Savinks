import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { isPastDate, isToday } from '../utils/dateUtils';

function formatAmount(amount) {
  return `RD$ ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getFrequencyLabel(frequency) {
  if (frequency === 'daily') {
    return 'Diario';
  }

  if (frequency === 'weekly') {
    return 'Semanal';
  }

  if (frequency === 'yearly') {
    return 'Anual';
  }

  return 'Mensual';
}

export default function RecurringCard({
  item,
  onDelete,
  onEdit,
  onToggle,
  isToggling = false,
}) {
  const isExpense = item.type === 'expense';
  const isOverdue = item.active && isPastDate(item.nextRunDate) && !isToday(item.nextRunDate);

  return (
    <View
      style={[
        styles.card,
        isExpense ? styles.expenseCard : styles.incomeCard,
        isOverdue && styles.overdueCard,
        !item.active && styles.inactiveCard,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>
            {item.category} - {getFrequencyLabel(item.frequency)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.active ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              item.active ? styles.activeBadgeText : styles.inactiveBadgeText,
            ]}
          >
            {item.active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Monto</Text>
          <Text style={[styles.amountValue, isExpense ? styles.expenseText : styles.incomeText]}>
            {item.type === 'income' ? '+' : '-'} {formatAmount(item.amount)}
          </Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Proximo</Text>
          <Text style={[styles.metaValue, isOverdue && styles.overdueText]}>
            {item.nextRunDate}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Inicio</Text>
          <Text style={styles.metaValue}>{item.startDate}</Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Fin</Text>
          <Text style={styles.metaValue}>{item.endDate || 'Sin fin'}</Text>
        </View>
      </View>

      {item.notes ? (
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Notas</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable
          disabled={isToggling}
          onPress={() => onToggle(item.id)}
          style={[styles.actionButton, styles.toggleButton, isToggling && styles.disabledButton]}
        >
          <Text style={styles.toggleButtonText}>
            {isToggling ? 'Procesando...' : item.active ? 'Desactivar' : 'Activar'}
          </Text>
        </Pressable>

        <Pressable
          disabled={isToggling}
          onPress={() => onEdit(item)}
          style={[styles.actionButton, styles.editButton, isToggling && styles.disabledButton]}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>

        <Pressable
          disabled={isToggling}
          onPress={() => onDelete(item.id)}
          style={[styles.actionButton, styles.deleteButton, isToggling && styles.disabledButton]}
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
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  expenseCard: {
    borderColor: '#7C2D12',
  },
  incomeCard: {
    borderColor: '#14532D',
  },
  overdueCard: {
    borderColor: '#7F1D1D',
    backgroundColor: '#1D1214',
  },
  inactiveCard: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
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
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  statusBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: '#0A2616',
    borderColor: '#14532D',
  },
  activeBadgeText: {
    color: theme.colors.successSoft,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
  },
  inactiveBadgeText: {
    color: theme.colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  expenseText: {
    color: '#FDBA74',
  },
  incomeText: {
    color: theme.colors.primarySoft,
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
  notesLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  notesText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
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
  toggleButton: {
    backgroundColor: '#0C2216',
    borderWidth: 1,
    borderColor: '#14532D',
  },
  toggleButtonText: {
    color: theme.colors.primarySoft,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#102235',
    borderWidth: 1,
    borderColor: '#0369A1',
  },
  editButtonText: {
    color: '#7DD3FC',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
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
  disabledButton: {
    opacity: 0.6,
  },
});
