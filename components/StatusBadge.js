import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

function getBadgeConfig(status, isOverdue) {
  if (isOverdue) {
    return {
      label: 'Vencido',
      containerStyle: styles.overdueContainer,
      textStyle: styles.overdueText,
    };
  }

  if (status === 'paid') {
    return {
      label: 'Pagado',
      containerStyle: styles.paidContainer,
      textStyle: styles.paidText,
    };
  }

  if (status === 'partial') {
    return {
      label: 'Parcial',
      containerStyle: styles.partialContainer,
      textStyle: styles.partialText,
    };
  }

  if (status === 'cancelled') {
    return {
      label: 'Cancelado',
      containerStyle: styles.cancelledContainer,
      textStyle: styles.cancelledText,
    };
  }

  return {
    label: 'Pendiente',
    containerStyle: styles.pendingContainer,
    textStyle: styles.pendingText,
  };
}

export default function StatusBadge({ status, isOverdue = false }) {
  const badgeConfig = getBadgeConfig(status, isOverdue);

  return (
    <View style={[styles.badge, badgeConfig.containerStyle]}>
      <Text style={[styles.text, badgeConfig.textStyle]}>{badgeConfig.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  pendingContainer: {
    backgroundColor: '#31230A',
    borderColor: '#7C5A12',
  },
  pendingText: {
    color: theme.colors.warning,
  },
  paidContainer: {
    backgroundColor: '#0A2616',
    borderColor: '#14532D',
  },
  paidText: {
    color: theme.colors.successSoft,
  },
  partialContainer: {
    backgroundColor: '#31230A',
    borderColor: '#92400E',
  },
  partialText: {
    color: '#FDBA74',
  },
  cancelledContainer: {
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
  },
  cancelledText: {
    color: theme.colors.textSecondary,
  },
  overdueContainer: {
    backgroundColor: '#311514',
    borderColor: '#7F1D1D',
  },
  overdueText: {
    color: '#FDBA74',
  },
});
