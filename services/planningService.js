import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatDate, getTodayISO } from '../utils/dateUtils';
import { saveTransaction } from './storageService';

const PLANNED_EXPENSES_STORAGE_KEY = '@savinks_planned_expenses';

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function normalizePlannedExpense(expense) {
  return {
    id: expense.id || createId('plan'),
    title: String(expense.title || '').trim(),
    amount: Number(expense.amount) || 0,
    category: String(expense.category || '').trim(),
    dueDate: formatDate(expense.dueDate),
    notes: String(expense.notes || '').trim(),
    status: expense.status || 'pending',
    reminder: Boolean(expense.reminder),
  };
}

function createPaidTransactionDescription(expense) {
  if (expense.notes) {
    return `${expense.title} - ${expense.notes}`;
  }

  return expense.title;
}

export async function loadPlannedExpenses() {
  try {
    const storedValue = await AsyncStorage.getItem(PLANNED_EXPENSES_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map(normalizePlannedExpense);
  } catch (error) {
    console.log('Error al cargar gastos planificados:', error);
    return [];
  }
}

export async function savePlannedExpenses(plannedExpenses) {
  const normalizedExpenses = Array.isArray(plannedExpenses)
    ? plannedExpenses.map(normalizePlannedExpense)
    : [];

  try {
    await AsyncStorage.setItem(
      PLANNED_EXPENSES_STORAGE_KEY,
      JSON.stringify(normalizedExpenses)
    );
  } catch (error) {
    console.log('Error al guardar gastos planificados:', error);
  }

  return normalizedExpenses;
}

export async function addPlannedExpense(expense, currentPlannedExpenses) {
  const normalizedExpense = normalizePlannedExpense(expense);
  const updatedExpenses = [normalizedExpense, ...(currentPlannedExpenses || [])];

  return savePlannedExpenses(updatedExpenses);
}

export async function updatePlannedExpense(expenseId, updates, currentPlannedExpenses) {
  const updatedExpenses = (currentPlannedExpenses || []).map((expense) =>
    expense.id === expenseId
      ? normalizePlannedExpense({
          ...expense,
          ...updates,
          id: expense.id,
        })
      : normalizePlannedExpense(expense)
  );

  return savePlannedExpenses(updatedExpenses);
}

export async function deletePlannedExpense(expenseId, currentPlannedExpenses) {
  const updatedExpenses = (currentPlannedExpenses || []).filter(
    (expense) => expense.id !== expenseId
  );

  return savePlannedExpenses(updatedExpenses);
}

export async function markPlannedExpenseAsPaid(
  expenseId,
  currentPlannedExpenses,
  currentTransactions
) {
  const plannedExpenses = currentPlannedExpenses || [];
  const plannedExpense = plannedExpenses.find((expense) => expense.id === expenseId);

  if (!plannedExpense || plannedExpense.status !== 'pending') {
    return {
      plannedExpenses,
      transactions: currentTransactions || [],
      createdTransaction: null,
    };
  }

  const createdTransaction = {
    id: createId('tx'),
    type: 'expense',
    amount: Number(plannedExpense.amount) || 0,
    category: plannedExpense.category,
    description: createPaidTransactionDescription(plannedExpense),
    date: getTodayISO(),
  };

  const updatedTransactions = await saveTransaction(
    createdTransaction,
    currentTransactions || []
  );
  const updatedPlannedExpenses = await updatePlannedExpense(
    expenseId,
    { status: 'paid' },
    plannedExpenses
  );

  return {
    plannedExpenses: updatedPlannedExpenses,
    transactions: updatedTransactions,
    createdTransaction,
  };
}
