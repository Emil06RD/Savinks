import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  formatDate,
  isPastDate,
  isToday,
} from '../utils/dateUtils';
import { saveTransaction } from './storageService';

const RECURRING_ITEMS_STORAGE_KEY = '@savinks_recurring_items';
const MAX_GENERATED_TRANSACTIONS_PER_ITEM = 24;
const MAX_RECURRING_ADVANCE_ATTEMPTS = 48;
const ALLOWED_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function normalizeMoney(value) {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue) || !Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.round(parsedValue * 100) / 100;
}

function normalizeGeneratedDates(dates) {
  if (!Array.isArray(dates)) {
    return [];
  }

  return [...new Set(dates.map((value) => formatDate(value)).filter(Boolean))].sort();
}

function getNextDateForFrequency(date, frequency) {
  if (frequency === 'daily') {
    return addDays(date, 1);
  }

  if (frequency === 'weekly') {
    return addWeeks(date, 1);
  }

  if (frequency === 'yearly') {
    return addYears(date, 1);
  }

  return addMonths(date, 1);
}

function normalizeRecurringItem(item) {
  const startDate = formatDate(item.startDate);
  const nextRunDate = formatDate(item.nextRunDate || startDate);
  const endDate = formatDate(item.endDate);

  return {
    id: item.id || createId('rec'),
    title: String(item.title || '').trim(),
    type: item.type === 'income' ? 'income' : 'expense',
    amount: normalizeMoney(item.amount),
    category: String(item.category || '').trim(),
    frequency: ALLOWED_FREQUENCIES.includes(item.frequency) ? item.frequency : 'monthly',
    startDate,
    nextRunDate,
    endDate,
    active: item.active !== false,
    notes: String(item.notes || '').trim(),
    generatedDates: normalizeGeneratedDates(item.generatedDates),
  };
}

function createRecurringTransaction(item, runDate) {
  return {
    id: createId('tx'),
    type: item.type,
    amount: normalizeMoney(item.amount),
    category: item.category,
    description: `Recurrente: ${item.title}`,
    date: runDate,
  };
}

function isDueDate(date) {
  return Boolean(date) && (isToday(date) || isPastDate(date));
}

export async function loadRecurringItems() {
  try {
    const storedValue = await AsyncStorage.getItem(RECURRING_ITEMS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map(normalizeRecurringItem);
  } catch (error) {
    console.log('Error al cargar recurrentes:', error);
    return [];
  }
}

export async function saveRecurringItems(items) {
  const normalizedItems = Array.isArray(items) ? items.map(normalizeRecurringItem) : [];

  try {
    await AsyncStorage.setItem(RECURRING_ITEMS_STORAGE_KEY, JSON.stringify(normalizedItems));
  } catch (error) {
    console.log('Error al guardar recurrentes:', error);
  }

  return normalizedItems;
}

export async function addRecurringItem(item, currentItems) {
  const normalizedItem = normalizeRecurringItem({
    ...item,
    generatedDates: item.generatedDates || [],
  });
  const updatedItems = [normalizedItem, ...(currentItems || [])];

  return saveRecurringItems(updatedItems);
}

export async function updateRecurringItem(itemId, updates, currentItems) {
  const updatedItems = (currentItems || []).map((item) =>
    item.id === itemId
      ? normalizeRecurringItem({
          ...item,
          ...updates,
          id: item.id,
        })
      : normalizeRecurringItem(item)
  );

  return saveRecurringItems(updatedItems);
}

export async function deleteRecurringItem(itemId, currentItems) {
  const updatedItems = (currentItems || []).filter((item) => item.id !== itemId);
  return saveRecurringItems(updatedItems);
}

export async function toggleRecurringItem(itemId, currentItems) {
  const item = (currentItems || []).find((entry) => entry.id === itemId);

  if (!item) {
    return currentItems || [];
  }

  return updateRecurringItem(itemId, { active: !item.active }, currentItems);
}

export async function processDueRecurringItems(currentItems, currentTransactions) {
  const recurringItems = (currentItems || []).map(normalizeRecurringItem);
  let updatedTransactions = currentTransactions || [];
  let generatedTransactionsCount = 0;

  const updatedItems = [];

  for (const item of recurringItems) {
    let updatedItem = normalizeRecurringItem(item);
    let generatedForItem = 0;
    let attemptCount = 0;

    if (
      updatedItem.active &&
      updatedItem.endDate &&
      updatedItem.nextRunDate &&
      updatedItem.nextRunDate > updatedItem.endDate
    ) {
      updatedItem = {
        ...updatedItem,
        active: false,
      };
    }

    while (
      updatedItem.active &&
      updatedItem.nextRunDate &&
      isDueDate(updatedItem.nextRunDate) &&
      generatedForItem < MAX_GENERATED_TRANSACTIONS_PER_ITEM &&
      attemptCount < MAX_RECURRING_ADVANCE_ATTEMPTS
    ) {
      const runDate = updatedItem.nextRunDate;
      const alreadyGenerated = updatedItem.generatedDates.includes(runDate);

      if (!alreadyGenerated) {
        const transaction = createRecurringTransaction(updatedItem, runDate);
        updatedTransactions = await saveTransaction(transaction, updatedTransactions);
        updatedItem = {
          ...updatedItem,
          generatedDates: [...updatedItem.generatedDates, runDate].sort(),
        };
        generatedForItem += 1;
        generatedTransactionsCount += 1;
      }

      const nextRunDate = getNextDateForFrequency(runDate, updatedItem.frequency);
      const shouldDeactivate = Boolean(
        updatedItem.endDate && nextRunDate && nextRunDate > updatedItem.endDate
      );

      updatedItem = {
        ...updatedItem,
        nextRunDate,
        active: shouldDeactivate ? false : updatedItem.active,
      };

      attemptCount += 1;
    }

    updatedItems.push(updatedItem);
  }

  const savedRecurringItems = await saveRecurringItems(updatedItems);

  return {
    recurringItems: savedRecurringItems,
    transactions: updatedTransactions,
    generatedTransactionsCount,
  };
}
