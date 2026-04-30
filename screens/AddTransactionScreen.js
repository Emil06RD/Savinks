import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { CATEGORY_OPTIONS } from '../constants/categories';
import { theme } from '../constants/theme';
import { formatDate, getTodayISO } from '../utils/dateUtils';

export default function AddTransactionScreen({ navigation, onAddTransaction }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayISO());

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(getTodayISO());
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    const formattedDate = formatDate(date.trim() || getTodayISO());

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a 0.');
      return;
    }

    if (!category) {
      Alert.alert('Categoria requerida', 'Selecciona una categoria.');
      return;
    }

    if (!formattedDate) {
      Alert.alert('Fecha invalida', 'Usa el formato YYYY-MM-DD.');
      return;
    }

    try {
      await onAddTransaction({
        type,
        amount: parsedAmount,
        category,
        description: description.trim(),
        date: formattedDate,
      });

      Alert.alert('Guardado', 'La transaccion se guardo correctamente.');
      resetForm();
      navigation.navigate('Movimientos');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la transaccion.');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Agregar transaccion</Text>
        <Text style={styles.subtitle}>
          Registra un ingreso o gasto y guardalo localmente.
        </Text>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            onPress={() => setType('income')}
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
              type === 'income' && styles.incomeTypeButton,
            ]}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
              Ingreso
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType('expense')}
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
              type === 'expense' && styles.expenseTypeButton,
            ]}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
              Gasto
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Monto</Text>
        <TextInput
          keyboardType="numeric"
          onChangeText={setAmount}
          placeholder="Ejemplo: 25.50"
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.input}
          value={amount}
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriesWrap}>
          {CATEGORY_OPTIONS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => setCategory(item.label)}
              style={[
                styles.categoryChip,
                category === item.label && styles.categoryChipActive,
              ]}
            >
              <Text style={styles.categoryChipIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  category === item.label && styles.categoryChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Descripcion</Text>
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={setDescription}
          placeholder="Opcional"
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={description}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.input}
          value={date}
        />

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar transaccion</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeButton: {
    flex: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  typeButtonActive: {
    borderWidth: 0,
  },
  incomeTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  expenseTypeButton: {
    backgroundColor: theme.colors.danger,
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 90,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#0C2216',
    borderColor: theme.colors.primary,
  },
  categoryChipIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryChipText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: theme.colors.primarySoft,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#052E16',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});
