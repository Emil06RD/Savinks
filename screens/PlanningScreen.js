import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import DebtCard from '../components/DebtCard';
import PlanningCard from '../components/PlanningCard';
import ScreenContainer from '../components/ScreenContainer';
import { CATEGORY_OPTIONS } from '../constants/categories';
import { theme } from '../constants/theme';
import { addDays, formatDate, isPastDate, isToday } from '../utils/dateUtils';

function createInitialExpenseFormState() {
  return {
    title: '',
    amount: '',
    category: '',
    dueDate: addDays(new Date(), 7),
    notes: '',
    reminder: false,
  };
}

function createInitialDebtFormState() {
  return {
    title: '',
    personOrCompany: '',
    amount: '',
    dueDate: addDays(new Date(), 7),
    notes: '',
    type: 'debtToPay',
  };
}

function formatAmount(value) {
  return `RD$ ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getExpenseStatusWeight(expense) {
  const isOverdue =
    expense.status === 'pending' &&
    isPastDate(expense.dueDate) &&
    !isToday(expense.dueDate);

  if (isOverdue) {
    return 0;
  }

  if (expense.status === 'pending') {
    return 1;
  }

  if (expense.status === 'paid') {
    return 2;
  }

  if (expense.status === 'cancelled') {
    return 3;
  }

  return 4;
}

function sortPlannedExpenses(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstWeight = getExpenseStatusWeight(firstItem);
    const secondWeight = getExpenseStatusWeight(secondItem);

    if (firstWeight !== secondWeight) {
      return firstWeight - secondWeight;
    }

    if (firstWeight <= 1) {
      return firstItem.dueDate.localeCompare(secondItem.dueDate);
    }

    return secondItem.dueDate.localeCompare(firstItem.dueDate);
  });
}

function getDebtStatusWeight(debt) {
  const isOverdue =
    debt.status !== 'paid' &&
    isPastDate(debt.dueDate) &&
    !isToday(debt.dueDate);

  if (isOverdue) {
    return 0;
  }

  if (debt.status === 'pending' || debt.status === 'partial') {
    return 1;
  }

  if (debt.status === 'paid') {
    return 2;
  }

  return 3;
}

function sortDebts(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstWeight = getDebtStatusWeight(firstItem);
    const secondWeight = getDebtStatusWeight(secondItem);

    if (firstWeight !== secondWeight) {
      return firstWeight - secondWeight;
    }

    if (firstWeight <= 1) {
      return firstItem.dueDate.localeCompare(secondItem.dueDate);
    }

    return secondItem.dueDate.localeCompare(firstItem.dueDate);
  });
}

export default function PlanningScreen({
  plannedExpenses,
  debts,
  onAddPlannedExpense,
  onDeletePlannedExpense,
  onMarkPlannedExpenseAsPaid,
  onAddDebt,
  onDeleteDebt,
  onRegisterDebtPayment,
}) {
  const [activeSection, setActiveSection] = useState('expenses');
  const [isExpenseFormVisible, setIsExpenseFormVisible] = useState(false);
  const [isDebtFormVisible, setIsDebtFormVisible] = useState(false);
  const [expenseForm, setExpenseForm] = useState(createInitialExpenseFormState);
  const [debtForm, setDebtForm] = useState(createInitialDebtFormState);
  const [processingExpenseId, setProcessingExpenseId] = useState('');
  const [processingDebtId, setProcessingDebtId] = useState('');

  const pendingExpenses = (plannedExpenses || []).filter((expense) => expense.status === 'pending');
  const sortedPlannedExpenses = sortPlannedExpenses(plannedExpenses || []);
  const expenseSummary = {
    pendingCount: pendingExpenses.length,
    overdueCount: pendingExpenses.filter(
      (expense) => isPastDate(expense.dueDate) && !isToday(expense.dueDate)
    ).length,
    pendingTotal: pendingExpenses.reduce(
      (sum, expense) => sum + (Number(expense.amount) || 0),
      0
    ),
  };

  const activeDebts = (debts || []).filter((debt) => debt.status !== 'paid');
  const sortedDebts = sortDebts(debts || []);
  const debtSummary = {
    activeCount: activeDebts.length,
    overdueCount: activeDebts.filter(
      (debt) => isPastDate(debt.dueDate) && !isToday(debt.dueDate)
    ).length,
    toPayTotal: activeDebts
      .filter((debt) => debt.type === 'debtToPay')
      .reduce((sum, debt) => sum + (Number(debt.remainingAmount) || 0), 0),
    toCollectTotal: activeDebts
      .filter((debt) => debt.type === 'debtToCollect')
      .reduce((sum, debt) => sum + (Number(debt.remainingAmount) || 0), 0),
  };

  const updateExpenseFormValue = (field, value) => {
    setExpenseForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateDebtFormValue = (field, value) => {
    setDebtForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetExpenseForm = () => {
    setExpenseForm(createInitialExpenseFormState());
    setIsExpenseFormVisible(false);
  };

  const resetDebtForm = () => {
    setDebtForm(createInitialDebtFormState());
    setIsDebtFormVisible(false);
  };

  const toggleCurrentForm = () => {
    if (activeSection === 'expenses') {
      setIsExpenseFormVisible((currentValue) => !currentValue);
      setIsDebtFormVisible(false);
      return;
    }

    setIsDebtFormVisible((currentValue) => !currentValue);
    setIsExpenseFormVisible(false);
  };

  const handleAddExpense = async () => {
    const normalizedDate = formatDate(expenseForm.dueDate);
    const parsedAmount = Number(expenseForm.amount);

    if (!expenseForm.title.trim()) {
      Alert.alert('Titulo requerido', 'Ingresa un nombre para el gasto futuro.');
      return;
    }

    if (!expenseForm.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a 0.');
      return;
    }

    if (!expenseForm.category) {
      Alert.alert('Categoria requerida', 'Selecciona una categoria.');
      return;
    }

    if (!normalizedDate) {
      Alert.alert('Fecha invalida', 'Usa el formato YYYY-MM-DD.');
      return;
    }

    try {
      await onAddPlannedExpense({
        title: expenseForm.title.trim(),
        amount: parsedAmount,
        category: expenseForm.category,
        dueDate: normalizedDate,
        notes: expenseForm.notes.trim(),
        status: 'pending',
        reminder: expenseForm.reminder,
      });

      Alert.alert('Guardado', 'El gasto futuro se guardo correctamente.');
      resetExpenseForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto futuro.');
    }
  };

  const handleAddDebt = async () => {
    const normalizedDate = formatDate(debtForm.dueDate);
    const parsedAmount = Number(debtForm.amount);

    if (!debtForm.title.trim()) {
      Alert.alert('Titulo requerido', 'Ingresa un nombre para la deuda.');
      return;
    }

    if (!debtForm.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a 0.');
      return;
    }

    if (!normalizedDate) {
      Alert.alert('Fecha invalida', 'Usa el formato YYYY-MM-DD.');
      return;
    }

    try {
      await onAddDebt({
        title: debtForm.title.trim(),
        personOrCompany: debtForm.personOrCompany.trim(),
        amount: parsedAmount,
        remainingAmount: parsedAmount,
        dueDate: normalizedDate,
        notes: debtForm.notes.trim(),
        status: 'pending',
        type: debtForm.type,
      });

      Alert.alert('Guardado', 'La deuda se guardo correctamente.');
      resetDebtForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la deuda.');
    }
  };

  const handleDeleteExpense = (expenseId) => {
    Alert.alert(
      'Eliminar gasto futuro',
      'Esta accion eliminara el gasto planificado guardado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeletePlannedExpense(expenseId),
        },
      ]
    );
  };

  const handleDeleteDebt = (debtId) => {
    Alert.alert('Eliminar deuda', 'Esta accion eliminara la deuda guardada.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => onDeleteDebt(debtId),
      },
    ]);
  };

  const handleMarkAsPaid = (expenseId) => {
    Alert.alert(
      'Marcar como pagado',
      'Se creara un gasto normal en tus movimientos y este plan quedara como pagado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setProcessingExpenseId(expenseId);
              await onMarkPlannedExpenseAsPaid(expenseId);
              Alert.alert('Pagado', 'El gasto ya fue enviado a tus movimientos.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo marcar el gasto como pagado.');
            } finally {
              setProcessingExpenseId('');
            }
          },
        },
      ]
    );
  };

  const handleRegisterDebtPayment = async (debtId, paymentAmount) => {
    try {
      setProcessingDebtId(debtId);
      const result = await onRegisterDebtPayment(debtId, paymentAmount);
      const isIncomeTransaction = result.createdTransaction?.type === 'income';

      Alert.alert(
        isIncomeTransaction ? 'Cobro registrado' : 'Pago registrado',
        isIncomeTransaction
          ? 'El cobro se agrego a tus movimientos.'
          : 'El pago se agrego a tus movimientos.'
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo registrar el movimiento de deuda.');
      throw error;
    } finally {
      setProcessingDebtId('');
    }
  };

  const currentData = activeSection === 'expenses' ? sortedPlannedExpenses : sortedDebts;

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={styles.content}
        data={currentData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.title}>Planificacion</Text>
                <Text style={styles.subtitle}>
                  Organiza gastos futuros y deudas sin romper tu flujo actual de movimientos.
                </Text>
              </View>

              <View style={styles.sectionTabs}>
                <Pressable
                  onPress={() => {
                    setActiveSection('expenses');
                    setIsDebtFormVisible(false);
                  }}
                  style={[
                    styles.sectionTabButton,
                    activeSection === 'expenses' && styles.sectionTabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionTabText,
                      activeSection === 'expenses' && styles.sectionTabTextActive,
                    ]}
                  >
                    Gastos futuros
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setActiveSection('debts');
                    setIsExpenseFormVisible(false);
                  }}
                  style={[
                    styles.sectionTabButton,
                    activeSection === 'debts' && styles.sectionTabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionTabText,
                      activeSection === 'debts' && styles.sectionTabTextActive,
                    ]}
                  >
                    Deudas
                  </Text>
                </Pressable>
              </View>

              <Pressable onPress={toggleCurrentForm} style={styles.addButton}>
                <Text style={styles.addButtonText}>
                  {activeSection === 'expenses'
                    ? isExpenseFormVisible
                      ? 'Cerrar'
                      : 'Nuevo gasto'
                    : isDebtFormVisible
                      ? 'Cerrar'
                      : 'Nueva deuda'}
                </Text>
              </Pressable>
            </View>

            {activeSection === 'expenses' ? (
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Pendientes</Text>
                  <Text style={styles.summaryValue}>{expenseSummary.pendingCount}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Por pagar</Text>
                  <Text style={styles.summaryValue}>{formatAmount(expenseSummary.pendingTotal)}</Text>
                </View>

                <View
                  style={[
                    styles.summaryCard,
                    expenseSummary.overdueCount > 0 && styles.warningCard,
                  ]}
                >
                  <Text style={styles.summaryLabel}>Vencidos</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      expenseSummary.overdueCount > 0 && styles.warningText,
                    ]}
                  >
                    {expenseSummary.overdueCount}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Activas</Text>
                  <Text style={styles.summaryValue}>{debtSummary.activeCount}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Por pagar</Text>
                  <Text style={[styles.summaryValue, styles.payText]}>
                    {formatAmount(debtSummary.toPayTotal)}
                  </Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Por cobrar</Text>
                  <Text style={[styles.summaryValue, styles.collectText]}>
                    {formatAmount(debtSummary.toCollectTotal)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryCard,
                    debtSummary.overdueCount > 0 && styles.warningCard,
                  ]}
                >
                  <Text style={styles.summaryLabel}>Vencidas</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      debtSummary.overdueCount > 0 && styles.warningText,
                    ]}
                  >
                    {debtSummary.overdueCount}
                  </Text>
                </View>
              </View>
            )}

            {activeSection === 'expenses' && isExpenseFormVisible ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Agregar gasto futuro</Text>

                <Text style={styles.label}>Titulo</Text>
                <TextInput
                  onChangeText={(value) => updateExpenseFormValue('title', value)}
                  placeholder="Ejemplo: Alquiler de mayo"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={expenseForm.title}
                />

                <Text style={styles.label}>Monto</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={(value) => updateExpenseFormValue('amount', value)}
                  placeholder="Ejemplo: 1500"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={expenseForm.amount}
                />

                <Text style={styles.label}>Categoria</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesRow}
                >
                  {CATEGORY_OPTIONS.map((item) => (
                    <Pressable
                      key={item.label}
                      onPress={() => updateExpenseFormValue('category', item.label)}
                      style={[
                        styles.categoryChip,
                        expenseForm.category === item.label && styles.categoryChipActive,
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.categoryText,
                          expenseForm.category === item.label && styles.categoryTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Fecha de vencimiento</Text>
                <TextInput
                  onChangeText={(value) => updateExpenseFormValue('dueDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={expenseForm.dueDate}
                />

                <Text style={styles.label}>Notas</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  onChangeText={(value) => updateExpenseFormValue('notes', value)}
                  placeholder="Opcional"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, styles.notesInput]}
                  textAlignVertical="top"
                  value={expenseForm.notes}
                />

                <View style={styles.reminderRow}>
                  <View>
                    <Text style={styles.reminderLabel}>Recordatorio local</Text>
                    <Text style={styles.reminderHint}>
                      Guardalo como parte del plan para revisarlo luego.
                    </Text>
                  </View>
                  <Switch
                    onValueChange={(value) => updateExpenseFormValue('reminder', value)}
                    thumbColor={expenseForm.reminder ? theme.colors.white : '#D4D4D8'}
                    trackColor={{
                      false: theme.colors.muted,
                      true: theme.colors.primary,
                    }}
                    value={expenseForm.reminder}
                  />
                </View>

                <View style={styles.formActionsRow}>
                  <Pressable
                    onPress={resetExpenseForm}
                    style={[styles.formButton, styles.cancelButton]}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddExpense}
                    style={[styles.formButton, styles.saveButton]}
                  >
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {activeSection === 'debts' && isDebtFormVisible ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Agregar deuda</Text>

                <Text style={styles.label}>Titulo</Text>
                <TextInput
                  onChangeText={(value) => updateDebtFormValue('title', value)}
                  placeholder="Ejemplo: Prestamo del carro"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={debtForm.title}
                />

                <Text style={styles.label}>Persona o empresa</Text>
                <TextInput
                  onChangeText={(value) => updateDebtFormValue('personOrCompany', value)}
                  placeholder="Opcional"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={debtForm.personOrCompany}
                />

                <Text style={styles.label}>Monto total</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={(value) => updateDebtFormValue('amount', value)}
                  placeholder="Ejemplo: 2500"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={debtForm.amount}
                />

                <Text style={styles.label}>Tipo de deuda</Text>
                <View style={styles.typeSelector}>
                  <Pressable
                    onPress={() => updateDebtFormValue('type', 'debtToPay')}
                    style={[
                      styles.typeOption,
                      debtForm.type === 'debtToPay' && styles.typeOptionPayActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        debtForm.type === 'debtToPay' && styles.typeOptionPayTextActive,
                      ]}
                    >
                      Debo pagar
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => updateDebtFormValue('type', 'debtToCollect')}
                    style={[
                      styles.typeOption,
                      debtForm.type === 'debtToCollect' && styles.typeOptionCollectActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        debtForm.type === 'debtToCollect' && styles.typeOptionCollectTextActive,
                      ]}
                    >
                      Debo cobrar
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Fecha de vencimiento</Text>
                <TextInput
                  onChangeText={(value) => updateDebtFormValue('dueDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={debtForm.dueDate}
                />

                <Text style={styles.label}>Notas</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  onChangeText={(value) => updateDebtFormValue('notes', value)}
                  placeholder="Opcional"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, styles.notesInput]}
                  textAlignVertical="top"
                  value={debtForm.notes}
                />

                <View style={styles.formActionsRow}>
                  <Pressable
                    onPress={resetDebtForm}
                    style={[styles.formButton, styles.cancelButton]}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable onPress={handleAddDebt} style={[styles.formButton, styles.saveButton]}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {activeSection === 'expenses'
                ? 'No hay gastos futuros guardados'
                : 'No hay deudas guardadas'}
            </Text>
            <Text style={styles.emptyText}>
              {activeSection === 'expenses'
                ? 'Agrega un plan para seguir pagos pendientes sin tocar tu balance actual.'
                : 'Agrega una deuda para controlar pagos y cobros pendientes desde este modulo.'}
            </Text>
          </View>
        }
        renderItem={({ item }) =>
          activeSection === 'expenses' ? (
            <PlanningCard
              isProcessing={processingExpenseId === item.id}
              onDelete={handleDeleteExpense}
              onMarkAsPaid={handleMarkAsPaid}
              plannedExpense={item}
            />
          ) : (
            <DebtCard
              debt={item}
              isProcessing={processingDebtId === item.id}
              onDelete={handleDeleteDebt}
              onRegisterPayment={handleRegisterDebtPayment}
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    flexGrow: 1,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerTextBlock: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
  sectionTabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  sectionTabButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sectionTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  sectionTabTextActive: {
    color: '#052E16',
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
  },
  addButtonText: {
    color: '#052E16',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    minHeight: 86,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  warningCard: {
    borderColor: '#7C2D12',
    backgroundColor: '#1F1712',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  warningText: {
    color: '#FDBA74',
  },
  payText: {
    color: '#FDBA74',
  },
  collectText: {
    color: '#7DD3FC',
  },
  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.cardAlt,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  notesInput: {
    minHeight: 88,
  },
  categoriesRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.cardAlt,
  },
  categoryChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#0C2216',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: theme.colors.primarySoft,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardAlt,
    paddingHorizontal: theme.spacing.sm,
  },
  typeOptionPayActive: {
    backgroundColor: '#2F190E',
    borderColor: '#9A3412',
  },
  typeOptionCollectActive: {
    backgroundColor: '#102235',
    borderColor: '#0369A1',
  },
  typeOptionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  typeOptionPayTextActive: {
    color: '#FDBA74',
  },
  typeOptionCollectTextActive: {
    color: '#7DD3FC',
  },
  reminderRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  reminderLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
    maxWidth: 220,
  },
  formActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  formButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: '#052E16',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
