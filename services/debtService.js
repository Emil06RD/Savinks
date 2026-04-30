import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatDate, getTodayISO } from '../utils/dateUtils';
import { saveTransaction } from './storageService';

const DEBTS_STORAGE_KEY = '@savinks_debts';

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

function clampRemainingAmount(amount, remainingAmount) {
  return Math.min(Math.max(normalizeMoney(remainingAmount), 0), normalizeMoney(amount));
}

function getDebtStatus(amount, remainingAmount) {
  if (remainingAmount <= 0) {
    return 'paid';
  }

  if (remainingAmount < amount) {
    return 'partial';
  }

  return 'pending';
}

function normalizeDebt(debt) {
  const amount = normalizeMoney(debt.amount);
  const rawRemainingAmount =
    debt.remainingAmount === undefined || debt.remainingAmount === null
      ? amount
      : debt.remainingAmount;
  const remainingAmount = clampRemainingAmount(amount, rawRemainingAmount);

  return {
    id: debt.id || createId('debt'),
    title: String(debt.title || '').trim(),
    personOrCompany: String(debt.personOrCompany || '').trim(),
    amount,
    remainingAmount,
    dueDate: formatDate(debt.dueDate),
    notes: String(debt.notes || '').trim(),
    status: getDebtStatus(amount, remainingAmount),
    type: debt.type === 'debtToCollect' ? 'debtToCollect' : 'debtToPay',
  };
}

function buildDebtTransactionDescription(debt, paymentAmount) {
  const directionLabel =
    debt.type === 'debtToCollect' ? 'Cobro de deuda' : 'Pago de deuda';
  const personLabel = debt.personOrCompany ? ` - ${debt.personOrCompany}` : '';
  const notesLabel = debt.notes ? ` - ${debt.notes}` : '';

  return `${directionLabel}: ${debt.title}${personLabel}${notesLabel} (${paymentAmount.toFixed(2)})`;
}

export async function loadDebts() {
  try {
    const storedValue = await AsyncStorage.getItem(DEBTS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map(normalizeDebt);
  } catch (error) {
    console.log('Error al cargar deudas:', error);
    return [];
  }
}

export async function saveDebts(debts) {
  const normalizedDebts = Array.isArray(debts) ? debts.map(normalizeDebt) : [];

  try {
    await AsyncStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(normalizedDebts));
  } catch (error) {
    console.log('Error al guardar deudas:', error);
  }

  return normalizedDebts;
}

export async function addDebt(debt, currentDebts) {
  const normalizedDebt = normalizeDebt({
    ...debt,
    remainingAmount: debt.amount,
  });
  const updatedDebts = [normalizedDebt, ...(currentDebts || [])];

  return saveDebts(updatedDebts);
}

export async function updateDebt(debtId, updates, currentDebts) {
  const updatedDebts = (currentDebts || []).map((debt) =>
    debt.id === debtId
      ? normalizeDebt({
          ...debt,
          ...updates,
          id: debt.id,
        })
      : normalizeDebt(debt)
  );

  return saveDebts(updatedDebts);
}

export async function deleteDebt(debtId, currentDebts) {
  const updatedDebts = (currentDebts || []).filter((debt) => debt.id !== debtId);
  return saveDebts(updatedDebts);
}

export async function registerDebtPayment(
  debtId,
  paymentAmount,
  currentDebts,
  currentTransactions
) {
  const debts = currentDebts || [];
  const debt = debts.find((item) => item.id === debtId);

  if (!debt) {
    throw new Error('No se encontro la deuda seleccionada.');
  }

  if (debt.status === 'paid' || debt.remainingAmount <= 0) {
    throw new Error('Esta deuda ya fue saldada.');
  }

  const normalizedPaymentAmount = normalizeMoney(paymentAmount);

  if (normalizedPaymentAmount <= 0) {
    throw new Error('El monto del pago debe ser mayor a 0.');
  }

  if (normalizedPaymentAmount > normalizeMoney(debt.remainingAmount)) {
    throw new Error('El pago no puede ser mayor al monto restante.');
  }

  const nextRemainingAmount = normalizeMoney(
    normalizeMoney(debt.remainingAmount) - normalizedPaymentAmount
  );

  if (nextRemainingAmount < 0) {
    throw new Error('El monto restante no puede ser negativo.');
  }

  const createdTransaction = {
    id: createId('tx'),
    type: debt.type === 'debtToCollect' ? 'income' : 'expense',
    amount: normalizedPaymentAmount,
    category: 'Otros',
    description: buildDebtTransactionDescription(debt, normalizedPaymentAmount),
    date: getTodayISO(),
  };

  const updatedTransactions = await saveTransaction(
    createdTransaction,
    currentTransactions || []
  );
  const updatedDebts = await updateDebt(
    debtId,
    {
      remainingAmount: nextRemainingAmount,
      status: getDebtStatus(debt.amount, nextRemainingAmount),
    },
    debts
  );

  return {
    debts: updatedDebts,
    transactions: updatedTransactions,
    createdTransaction,
  };
}
