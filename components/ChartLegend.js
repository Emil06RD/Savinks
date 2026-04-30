import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

function formatCurrency(value) {
  return `RD$ ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ChartLegend({ data }) {
  return (
    <View style={styles.container}>
      {data.map((item) => (
        <View key={item.label} style={styles.row}>
          <View style={styles.labelSection}>
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.textGroup}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.percentage}>{item.percentage.toFixed(1)}%</Text>
            </View>
          </View>

          <Text style={[styles.value, { color: item.color }]}>{formatCurrency(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  labelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 22,
    marginRight: theme.spacing.sm,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  percentage: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  value: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
  },
});
