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

import RecurringCard from '../components/RecurringCard';
import ScreenContainer from '../components/ScreenContainer';
import { CATEGORY_OPTIONS } from '../constants/categories';
import { theme } from '../constants/theme';
import { formatDate, getTodayISO, isPastDate, isToday } from '../utils/dateUtils';

function createInitialFormState() {
  const today = getTodayISO();

  return {
    title: '',
    type: 'expense',
    amount: '',
    category: '',
    frequency: 'monthly',
    startDate: today,
    nextRunDate: today,
    endDate: '',
    active: true,
    notes: '',
    generatedDates: [],
  };
}

function formatAmount(value) {
  return `RD$ ${Number(value).toLocaleString('en-US', {
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

function sortRecurringItems(items) {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.active !== secondItem.active) {
      return firstItem.active ? -1 : 1;
    }

    const firstOverdue = firstItem.active && isPastDate(firstItem.nextRunDate) && !isToday(firstItem.nextRunDate);
    const secondOverdue =
      secondItem.active && isPastDate(secondItem.nextRunDate) && !isToday(secondItem.nextRunDate);

    if (firstOverdue !== secondOverdue) {
      return firstOverdue ? -1 : 1;
    }

    return firstItem.nextRunDate.localeCompare(secondItem.nextRunDate);
  });
}

export default function RecurringScreen({
  recurringItems,
  onAddRecurringItem,
  onUpdateRecurringItem,
  onDeleteRecurringItem,
  onToggleRecurringItem,
}) {
  const [form, setForm] = useState(createInitialFormState);
  const [editingItemId, setEditingItemId] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [processingToggleId, setProcessingToggleId] = useState('');

  const sortedRecurringItems = sortRecurringItems(recurringItems || []);
  const activeItems = (recurringItems || []).filter((item) => item.active);
  const inactiveItems = (recurringItems || []).filter((item) => !item.active);
  const dueTodayCount = activeItems.filter(
    (item) => isToday(item.nextRunDate) || isPastDate(item.nextRunDate)
  ).length;
  const summary = {
    activeCount: activeItems.length,
    inactiveCount: inactiveItems.length,
    dueTodayCount,
  };

  const updateFormValue = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(createInitialFormState());
    setEditingItemId('');
    setIsFormVisible(false);
  };

  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setForm({
      title: item.title,
      type: item.type,
      amount: String(item.amount),
      category: item.category,
      frequency: item.frequency,
      startDate: item.startDate,
      nextRunDate: item.nextRunDate,
      endDate: item.endDate || '',
      active: item.active,
      notes: item.notes || '',
      generatedDates: item.generatedDates || [],
    });
    setIsFormVisible(true);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(form.amount);
    const startDate = formatDate(form.startDate);
    const nextRunDate = formatDate(form.nextRunDate);
    const endDate = form.endDate ? formatDate(form.endDate) : '';

    if (!form.title.trim()) {
      Alert.alert('Titulo requerido', 'Ingresa un nombre para el recurrente.');
      return;
    }

    if (!form.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a 0.');
      return;
    }

    if (!form.category) {
      Alert.alert('Categoria requerida', 'Selecciona una categoria.');
      return;
    }

    if (!startDate || !nextRunDate) {
      Alert.alert('Fecha invalida', 'Usa el formato YYYY-MM-DD.');
      return;
    }

    if (endDate && endDate < startDate) {
      Alert.alert('Fecha final invalida', 'La fecha final no puede ser anterior al inicio.');
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        amount: parsedAmount,
        category: form.category,
        frequency: form.frequency,
        startDate,
        nextRunDate,
        endDate,
        active: form.active,
        notes: form.notes.trim(),
        generatedDates: form.generatedDates || [],
      };

      if (editingItemId) {
        await onUpdateRecurringItem(editingItemId, payload);
        Alert.alert('Actualizado', 'El recurrente se actualizo correctamente.');
      } else {
        await onAddRecurringItem(payload);
        Alert.alert('Guardado', 'El recurrente se guardo correctamente.');
      }

      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el recurrente.');
    }
  };

  const handleDelete = (itemId) => {
    Alert.alert('Eliminar recurrente', 'Esta accion eliminara el recurrente guardado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => onDeleteRecurringItem(itemId),
      },
    ]);
  };

  const handleToggle = async (itemId) => {
    try {
      setProcessingToggleId(itemId);
      await onToggleRecurringItem(itemId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del recurrente.');
    } finally {
      setProcessingToggleId('');
    }
  };

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={styles.content}
        data={sortedRecurringItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.title}>Recurrentes</Text>
                <Text style={styles.subtitle}>
                  Programa ingresos y gastos para que se conviertan en movimientos normales cuando toque.
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  if (isFormVisible) {
                    resetForm();
                    return;
                  }

                  setIsFormVisible(true);
                }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>
                  {isFormVisible ? 'Cerrar' : 'Nuevo recurrente'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Activos</Text>
                <Text style={styles.summaryValue}>{summary.activeCount}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Inactivos</Text>
                <Text style={styles.summaryValue}>{summary.inactiveCount}</Text>
              </View>

              <View style={[styles.summaryCard, summary.dueTodayCount > 0 && styles.warningCard]}>
                <Text style={styles.summaryLabel}>Por correr</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    summary.dueTodayCount > 0 && styles.warningText,
                  ]}
                >
                  {summary.dueTodayCount}
                </Text>
              </View>
            </View>

            {isFormVisible ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingItemId ? 'Editar recurrente' : 'Agregar recurrente'}
                </Text>

                <Text style={styles.label}>Titulo</Text>
                <TextInput
                  onChangeText={(value) => updateFormValue('title', value)}
                  placeholder="Ejemplo: Netflix"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={form.title}
                />

                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeSelector}>
                  <Pressable
                    onPress={() => updateFormValue('type', 'expense')}
                    style={[
                      styles.typeOption,
                      form.type === 'expense' && styles.expenseTypeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        form.type === 'expense' && styles.expenseTypeTextActive,
                      ]}
                    >
                      Gasto
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => updateFormValue('type', 'income')}
                    style={[
                      styles.typeOption,
                      form.type === 'income' && styles.incomeTypeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        form.type === 'income' && styles.incomeTypeTextActive,
                      ]}
                    >
                      Ingreso
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Monto</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={(value) => updateFormValue('amount', value)}
                  placeholder="Ejemplo: 15.99"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={form.amount}
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
                      onPress={() => updateFormValue('category', item.label)}
                      style={[
                        styles.categoryChip,
                        form.category === item.label && styles.categoryChipActive,
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.categoryText,
                          form.category === item.label && styles.categoryTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Frecuencia</Text>
                <View style={styles.frequencyWrap}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((frequency) => (
                    <Pressable
                      key={frequency}
                      onPress={() => updateFormValue('frequency', frequency)}
                      style={[
                        styles.frequencyChip,
                        form.frequency === frequency && styles.frequencyChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          form.frequency === frequency && styles.frequencyTextActive,
                        ]}
                      >
                        {getFrequencyLabel(frequency)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Fecha de inicio</Text>
                <TextInput
                  onChangeText={(value) => updateFormValue('startDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={form.startDate}
                />

                <Text style={styles.label}>Proxima ejecucion</Text>
                <TextInput
                  onChangeText={(value) => updateFormValue('nextRunDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={form.nextRunDate}
                />

                <Text style={styles.label}>Fecha final</Text>
                <TextInput
                  onChangeText={(value) => updateFormValue('endDate', value)}
                  placeholder="Opcional YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={form.endDate}
                />

                <Text style={styles.label}>Notas</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  onChangeText={(value) => updateFormValue('notes', value)}
                  placeholder="Opcional"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, styles.notesInput]}
                  textAlignVertical="top"
                  value={form.notes}
                />

                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchLabel}>Activo</Text>
                    <Text style={styles.switchHint}>
                      Solo los recurrentes activos generan movimientos automaticamente.
                    </Text>
                  </View>
                  <Switch
                    onValueChange={(value) => updateFormValue('active', value)}
                    thumbColor={form.active ? theme.colors.white : '#D4D4D8'}
                    trackColor={{
                      false: theme.colors.muted,
                      true: theme.colors.primary,
                    }}
                    value={form.active}
                  />
                </View>

                <View style={styles.formActionsRow}>
                  <Pressable onPress={resetForm} style={[styles.formButton, styles.cancelButton]}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable onPress={handleSubmit} style={[styles.formButton, styles.saveButton]}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay recurrentes guardados</Text>
            <Text style={styles.emptyText}>
              Agrega un ingreso o gasto programado para automatizar tus movimientos.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RecurringCard
            isToggling={processingToggleId === item.id}
            item={item}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onToggle={handleToggle}
          />
        )}
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
    marginBottom: theme.spacing.md,
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
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
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
  },
  typeOptionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  expenseTypeActive: {
    backgroundColor: '#2F190E',
    borderColor: '#9A3412',
  },
  expenseTypeTextActive: {
    color: '#FDBA74',
  },
  incomeTypeActive: {
    backgroundColor: '#0C2216',
    borderColor: '#14532D',
  },
  incomeTypeTextActive: {
    color: theme.colors.primarySoft,
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
  frequencyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  frequencyChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.cardAlt,
  },
  frequencyChipActive: {
    backgroundColor: '#102235',
    borderColor: '#0369A1',
  },
  frequencyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  frequencyTextActive: {
    color: '#7DD3FC',
  },
  switchRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchHint: {
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
