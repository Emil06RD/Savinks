import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { theme } from './constants/theme';
import AppNavigator from './navigation/AppNavigator';
import { addDebt, deleteDebt, loadDebts, registerDebtPayment } from './services/debtService';
import {
  addPlannedExpense,
  deletePlannedExpense,
  loadPlannedExpenses,
  markPlannedExpenseAsPaid,
} from './services/planningService';
import {
  addRecurringItem,
  deleteRecurringItem,
  loadRecurringItems,
  processDueRecurringItems,
  toggleRecurringItem,
  updateRecurringItem,
} from './services/recurringService';
import { getSummary } from './services/transactionUtils';
import { deleteTransactionById, loadTransactions, saveTransaction } from './services/storageService';
import { checkForAppUpdate } from './services/versionService';

export default function App() {
  const [debts, setDebts] = useState([]);
  const [plannedExpenses, setPlannedExpenses] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [storedTransactions, storedPlannedExpenses, storedDebts, storedRecurringItems] =
          await Promise.all([
            loadTransactions(),
            loadPlannedExpenses(),
            loadDebts(),
            loadRecurringItems(),
          ]);

        let finalTransactions = storedTransactions;
        let finalRecurringItems = storedRecurringItems;

        try {
          const recurringResult = await processDueRecurringItems(
            storedRecurringItems,
            storedTransactions
          );
          finalTransactions = recurringResult.transactions;
          finalRecurringItems = recurringResult.recurringItems;
        } catch (error) {
          console.log('Error al procesar recurrentes:', error);
        }

        setTransactions(finalTransactions);
        setPlannedExpenses(storedPlannedExpenses);
        setDebts(storedDebts);
        setRecurringItems(finalRecurringItems);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    checkForAppUpdate();
  }, []);

  const handleAddTransaction = async (transactionData) => {
    const newTransaction = {
      id: `${Date.now()}`,
      ...transactionData,
      amount: Number(transactionData.amount),
    };

    const updatedTransactions = await saveTransaction(newTransaction, transactions);
    setTransactions(updatedTransactions);
  };

  const handleDeleteTransaction = async (transactionId) => {
    const updatedTransactions = await deleteTransactionById(transactionId, transactions);
    setTransactions(updatedTransactions);
  };

  const handleAddPlannedExpense = async (expenseData) => {
    const updatedPlannedExpenses = await addPlannedExpense(expenseData, plannedExpenses);
    setPlannedExpenses(updatedPlannedExpenses);
  };

  const handleDeletePlannedExpense = async (expenseId) => {
    const updatedPlannedExpenses = await deletePlannedExpense(expenseId, plannedExpenses);
    setPlannedExpenses(updatedPlannedExpenses);
  };

  const handleMarkPlannedExpenseAsPaid = async (expenseId) => {
    const result = await markPlannedExpenseAsPaid(expenseId, plannedExpenses, transactions);
    setPlannedExpenses(result.plannedExpenses);
    setTransactions(result.transactions);
  };

  const handleAddDebt = async (debtData) => {
    const updatedDebts = await addDebt(debtData, debts);
    setDebts(updatedDebts);
  };

  const handleDeleteDebt = async (debtId) => {
    const updatedDebts = await deleteDebt(debtId, debts);
    setDebts(updatedDebts);
  };

  const handleRegisterDebtPayment = async (debtId, paymentAmount) => {
    const result = await registerDebtPayment(debtId, paymentAmount, debts, transactions);
    setDebts(result.debts);
    setTransactions(result.transactions);
    return result;
  };

  const handleAddRecurringItem = async (itemData) => {
    const updatedItems = await addRecurringItem(itemData, recurringItems);
    setRecurringItems(updatedItems);
  };

  const handleUpdateRecurringItem = async (itemId, updates) => {
    const updatedItems = await updateRecurringItem(itemId, updates, recurringItems);
    setRecurringItems(updatedItems);
  };

  const handleDeleteRecurringItem = async (itemId) => {
    const updatedItems = await deleteRecurringItem(itemId, recurringItems);
    setRecurringItems(updatedItems);
  };

  const handleToggleRecurringItem = async (itemId) => {
    const updatedItems = await toggleRecurringItem(itemId, recurringItems);
    setRecurringItems(updatedItems);
  };

  const summary = getSummary(transactions);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <StatusBar style="light" />
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator
        debts={debts}
        onAddDebt={handleAddDebt}
        onAddPlannedExpense={handleAddPlannedExpense}
        onAddRecurringItem={handleAddRecurringItem}
        onAddTransaction={handleAddTransaction}
        onDeleteDebt={handleDeleteDebt}
        onDeletePlannedExpense={handleDeletePlannedExpense}
        onDeleteRecurringItem={handleDeleteRecurringItem}
        onDeleteTransaction={handleDeleteTransaction}
        onMarkPlannedExpenseAsPaid={handleMarkPlannedExpenseAsPaid}
        onRegisterDebtPayment={handleRegisterDebtPayment}
        onToggleRecurringItem={handleToggleRecurringItem}
        onUpdateRecurringItem={handleUpdateRecurringItem}
        plannedExpenses={plannedExpenses}
        recurringItems={recurringItems}
        summary={summary}
        transactions={transactions}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
