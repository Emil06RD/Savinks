import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import TransactionItem from '../components/TransactionItem';
import { theme } from '../constants/theme';
import { sortByMostRecentDate } from '../utils/dateFilters';

export default function TransactionsScreen({ transactions, onDeleteTransaction }) {
  const sortedTransactions = sortByMostRecentDate(transactions);

  const handleDelete = (transactionId) => {
    Alert.alert('Eliminar transaccion', 'Esta accion quitara el movimiento guardado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => onDeleteTransaction(transactionId),
      },
    ]);
  };

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={styles.content}
        data={sortedTransactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Tus transacciones</Text>
            <Text style={styles.subtitle}>
              Revisa tus ingresos y gastos. Puedes eliminar cualquier movimiento.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay transacciones guardadas</Text>
            <Text style={styles.emptyText}>
              Agrega tu primer ingreso o gasto desde la pestana Agregar.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TransactionItem onDelete={handleDelete} transaction={item} />
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
    marginBottom: theme.spacing.md,
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
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
