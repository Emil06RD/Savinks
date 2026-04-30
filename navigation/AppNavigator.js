import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { theme } from '../constants/theme';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PlanningScreen from '../screens/PlanningScreen';
import RecurringScreen from '../screens/RecurringScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

const Tab = createBottomTabNavigator();
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.card,
    border: theme.colors.border,
    primary: theme.colors.primary,
    text: theme.colors.text,
  },
};

export default function AppNavigator({
  transactions,
  debts,
  plannedExpenses,
  recurringItems,
  summary,
  onAddDebt,
  onAddTransaction,
  onDeleteDebt,
  onDeleteTransaction,
  onAddPlannedExpense,
  onAddRecurringItem,
  onDeletePlannedExpense,
  onDeleteRecurringItem,
  onMarkPlannedExpenseAsPaid,
  onRegisterDebtPayment,
  onToggleRecurringItem,
  onUpdateRecurringItem,
}) {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: '700',
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            height: 68,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
          },
        }}
      >
        <Tab.Screen name="Dashboard">
          {() => <DashboardScreen summary={summary} transactions={transactions} />}
        </Tab.Screen>
        <Tab.Screen name="Agregar">
          {({ navigation }) => (
            <AddTransactionScreen navigation={navigation} onAddTransaction={onAddTransaction} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Movimientos">
          {() => (
            <TransactionsScreen
              onDeleteTransaction={onDeleteTransaction}
              transactions={transactions}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Planificacion" options={{ title: 'Planificacion' }}>
          {() => (
            <PlanningScreen
              debts={debts}
              onAddDebt={onAddDebt}
              onAddPlannedExpense={onAddPlannedExpense}
              onDeleteDebt={onDeleteDebt}
              onDeletePlannedExpense={onDeletePlannedExpense}
              onMarkPlannedExpenseAsPaid={onMarkPlannedExpenseAsPaid}
              onRegisterDebtPayment={onRegisterDebtPayment}
              plannedExpenses={plannedExpenses}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Recurrentes" options={{ title: 'Recurrentes' }}>
          {() => (
            <RecurringScreen
              onAddRecurringItem={onAddRecurringItem}
              onDeleteRecurringItem={onDeleteRecurringItem}
              onToggleRecurringItem={onToggleRecurringItem}
              onUpdateRecurringItem={onUpdateRecurringItem}
              recurringItems={recurringItems}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
