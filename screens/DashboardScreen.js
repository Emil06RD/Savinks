import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ChartLegend from '../components/ChartLegend';
import DonutChart from '../components/DonutChart';
import PeriodSelector from '../components/PeriodSelector';
import ScreenContainer from '../components/ScreenContainer';
import StatCard from '../components/StatCard';
import { getCategoryMeta } from '../constants/categories';
import { theme } from '../constants/theme';
import { getExpenseDistribution } from '../utils/analytics';
import { sortByMostRecentDate } from '../utils/dateFilters';

function formatCurrency(value) {
  return `RD$ ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardScreen({ summary, transactions }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const analytics = getExpenseDistribution(transactions, selectedPeriod);
  const recentTransactions = sortByMostRecentDate(transactions).slice(0, 4);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hola, Emil 👋</Text>
          <Text style={styles.greetingSubtitle}>
            Controla tus gastos y haz crecer tus Savinks.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Balance actual</Text>
          <Text style={styles.heroValue}>{formatCurrency(summary.balance)}</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaBadge}>
              <Text style={styles.heroMetaLabel}>Mes actual</Text>
              <Text style={styles.heroMetaValue}>{formatCurrency(summary.monthlyNet)}</Text>
            </View>
            <View style={styles.heroMetaBadge}>
              <Text style={styles.heroMetaLabel}>Movimientos</Text>
              <Text style={styles.heroMetaValue}>{summary.transactionCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            accentColor={theme.colors.income}
            label="Ingresos"
            value={formatCurrency(summary.income)}
          />
          <StatCard
            accentColor={theme.colors.danger}
            label="Gastos"
            value={formatCurrency(summary.expenses)}
          />
          <StatCard
            accentColor={theme.colors.blue}
            label="Movimientos"
            value={String(summary.transactionCount)}
          />
          <StatCard
            accentColor={theme.colors.purple}
            label="Resumen mensual"
            value={formatCurrency(summary.monthlyNet)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen del mes</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ingresos del mes</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {formatCurrency(summary.monthlyIncome)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gastos del mes</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {formatCurrency(summary.monthlyExpenses)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance del mes</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.monthlyNet)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.analyticsHeader}>
            <Text style={styles.sectionTitle}>Gastos por categoria</Text>
            <Text style={styles.analyticsSubtitle}>Analitica automatica por periodo</Text>
          </View>

          <PeriodSelector
            onSelectPeriod={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />

          {analytics.total > 0 ? (
            <>
              <DonutChart data={analytics.chartData} total={analytics.total} />
              <ChartLegend data={analytics.chartData} />
            </>
          ) : (
            <View style={styles.analyticsEmptyState}>
              <Text style={styles.analyticsEmptyTitle}>No hay gastos en este periodo</Text>
              <Text style={styles.analyticsEmptyText}>
                Agrega un gasto para ver el grafico.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>
              Aun no hay movimientos. Agrega tu primera transaccion en la pestana Agregar.
            </Text>
          ) : (
            recentTransactions.map((transaction) => {
              const categoryMeta = getCategoryMeta(transaction.category);

              return (
                <View key={transaction.id} style={styles.recentItem}>
                  <View style={styles.recentLeft}>
                    <View style={styles.recentIconBadge}>
                      <Text style={styles.recentIcon}>{categoryMeta.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.recentCategory}>{transaction.category}</Text>
                      <Text style={styles.recentDate}>{transaction.date}</Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.recentAmount,
                      transaction.type === 'income' ? styles.incomeText : styles.expenseText,
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'} RD${' '}
                    {Number(transaction.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  greetingSection: {
    marginBottom: theme.spacing.md,
  },
  greetingTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  greetingSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  heroLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  heroValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  heroMetaBadge: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroMetaLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4,
  },
  heroMetaValue: {
    color: theme.colors.primarySoft,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  analyticsHeader: {
    marginBottom: theme.spacing.sm,
  },
  analyticsSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.sm,
  },
  analyticsEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  analyticsEmptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  analyticsEmptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  incomeText: {
    color: theme.colors.income,
  },
  expenseText: {
    color: theme.colors.danger,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  recentIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentIcon: {
    fontSize: 20,
  },
  recentCategory: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  recentDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  recentAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
});
