import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../constants/theme';
import { isPastDate, isToday } from '../utils/dateUtils';
import StatusBadge from './StatusBadge';

function formatAmount(amount) {
  return `RD$ ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getTypeLabel(type) {
  return type === 'debtToCollect' ? 'Por cobrar' : 'Por pagar';
}

export default function DebtCard({ debt, isProcessing, onDelete, onRegisterPayment }) {
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const isPaid = debt.status === 'paid';
  const isOverdue = !isPaid && isPastDate(debt.dueDate) && !isToday(debt.dueDate);
  const clearedAmount = Math.max(Number(debt.amount) - Number(debt.remainingAmount), 0);
  const progress = debt.amount > 0 ? clearedAmount / Number(debt.amount) : 0;
  const isDebtToCollect = debt.type === 'debtToCollect';

  const handleSubmitPayment = async (amountValue) => {
    try {
      await onRegisterPayment(debt.id, amountValue);
      setPaymentAmount('');
      setIsPaymentVisible(false);
    } catch (error) {
      // The parent screen already shows a user-facing alert.
    }
  };

  return (
    <View
      style={[
        styles.card,
        isDebtToCollect ? styles.collectCard : styles.payCard,
        isOverdue && styles.overdueCard,
        isPaid && styles.paidCard,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{debt.title}</Text>
          {debt.personOrCompany ? (
            <Text style={styles.personText}>{debt.personOrCompany}</Text>
          ) : null}
        </View>

        <StatusBadge isOverdue={isOverdue} status={debt.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.typeBadge, isDebtToCollect ? styles.collectBadge : styles.payBadge]}>
          <Text style={[styles.typeBadgeText, isDebtToCollect && styles.collectBadgeText]}>
            {getTypeLabel(debt.type)}
          </Text>
        </View>
        <Text style={[styles.dueDate, isOverdue && styles.overdueText]}>
          Vence: {debt.dueDate}
        </Text>
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>{formatAmount(debt.amount)}</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Restante</Text>
          <Text
            style={[
              styles.amountValue,
              isDebtToCollect ? styles.collectAmountText : styles.payAmountText,
            ]}
          >
            {formatAmount(debt.remainingAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              isDebtToCollect ? styles.collectProgressFill : styles.payProgressFill,
              { width: `${Math.min(progress * 100, 100)}%` },
            ]}
          />
        </View>
      </View>

      {debt.notes ? (
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Notas</Text>
          <Text style={styles.notesText}>{debt.notes}</Text>
        </View>
      ) : null}

      {!isPaid && isPaymentVisible ? (
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentTitle}>
            {isDebtToCollect ? 'Registrar cobro' : 'Registrar pago'}
          </Text>
          <TextInput
            editable={!isProcessing}
            keyboardType="numeric"
            onChangeText={setPaymentAmount}
            placeholder={`Maximo ${formatAmount(debt.remainingAmount)}`}
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.paymentInput}
            value={paymentAmount}
          />
          <Text style={styles.paymentHint}>
            Ingresa un monto entre RD$ 0.01 y {formatAmount(debt.remainingAmount)}.
          </Text>

          <View style={styles.paymentActionsRow}>
            <Pressable
              disabled={isProcessing}
              onPress={() => {
                setPaymentAmount('');
                setIsPaymentVisible(false);
              }}
              style={[styles.actionButton, styles.cancelButton, isProcessing && styles.disabledButton]}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              disabled={isProcessing}
              onPress={() => handleSubmitPayment(paymentAmount)}
              style={[
                styles.actionButton,
                styles.submitButton,
                isDebtToCollect && styles.collectSubmitButton,
                isProcessing && styles.disabledButton,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isProcessing ? 'Procesando...' : 'Registrar'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            disabled={isProcessing}
            onPress={() => handleSubmitPayment(debt.remainingAmount)}
            style={[
              styles.fullPaymentButton,
              isDebtToCollect && styles.collectFullPaymentButton,
              isProcessing && styles.disabledButton,
            ]}
          >
            <Text style={styles.fullPaymentButtonText}>
              {isDebtToCollect ? 'Cobrar todo el restante' : 'Pagar todo el restante'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        {!isPaid ? (
          <Pressable
            disabled={isProcessing}
            onPress={() => setIsPaymentVisible((currentValue) => !currentValue)}
            style={[
              styles.actionButton,
              isDebtToCollect ? styles.collectActionButton : styles.payActionButton,
              isProcessing && styles.disabledButton,
            ]}
          >
            <Text
              style={[
                styles.primaryActionText,
                isDebtToCollect && styles.collectPrimaryActionText,
              ]}
            >
              {isPaymentVisible
                ? 'Ocultar pago'
                : isDebtToCollect
                  ? 'Registrar cobro'
                  : 'Registrar pago'}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          disabled={isProcessing}
          onPress={() => onDelete(debt.id)}
          style={[
            styles.actionButton,
            styles.deleteButton,
            isPaid && styles.fullWidthButton,
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
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  payCard: {
    borderColor: '#7C2D12',
  },
  collectCard: {
    borderColor: '#0F4C81',
  },
  overdueCard: {
    backgroundColor: '#1D1214',
    borderColor: '#7F1D1D',
  },
  paidCard: {
    borderColor: '#14532D',
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
  personText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  typeBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  payBadge: {
    backgroundColor: '#2F190E',
    borderColor: '#9A3412',
  },
  collectBadge: {
    backgroundColor: '#102235',
    borderColor: '#0369A1',
  },
  typeBadgeText: {
    color: '#FDBA74',
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  collectBadgeText: {
    color: '#7DD3FC',
  },
  dueDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  overdueText: {
    color: '#FDBA74',
  },
  amountRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  amountBlock: {
    flex: 1,
  },
  amountLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amountValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  payAmountText: {
    color: '#FDBA74',
  },
  collectAmountText: {
    color: '#7DD3FC',
  },
  progressSection: {
    marginTop: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  progressValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: theme.colors.track,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
  payProgressFill: {
    backgroundColor: '#F97316',
  },
  collectProgressFill: {
    backgroundColor: '#38BDF8',
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
  paymentBlock: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardAlt,
  },
  paymentTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  paymentHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
    marginTop: theme.spacing.sm,
  },
  paymentActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
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
  payActionButton: {
    backgroundColor: '#2F190E',
    borderWidth: 1,
    borderColor: '#9A3412',
  },
  collectActionButton: {
    backgroundColor: '#102235',
    borderWidth: 1,
    borderColor: '#0369A1',
  },
  primaryActionText: {
    color: '#FDBA74',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  collectPrimaryActionText: {
    color: '#7DD3FC',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  collectSubmitButton: {
    backgroundColor: '#38BDF8',
  },
  submitButtonText: {
    color: '#052E16',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  fullPaymentButton: {
    minHeight: 42,
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B2A12',
    borderWidth: 1,
    borderColor: '#9A3412',
  },
  collectFullPaymentButton: {
    backgroundColor: '#12324A',
    borderColor: '#0284C7',
  },
  fullPaymentButtonText: {
    color: theme.colors.text,
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
