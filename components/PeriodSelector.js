import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

const PERIOD_OPTIONS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
];

export default function PeriodSelector({ selectedPeriod, onSelectPeriod }) {
  return (
    <View style={styles.container}>
      {PERIOD_OPTIONS.map((option) => {
        const isSelected = selectedPeriod === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onSelectPeriod(option.value)}
            style={[styles.button, isSelected && styles.selectedButton]}
          >
            <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  selectedButtonText: {
    color: '#052E16',
  },
});
