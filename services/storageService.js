import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_STORAGE_KEY = '@savinks_transactions';

export async function loadTransactions() {
  try {
    const storedValue = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedTransactions = JSON.parse(storedValue);
    return Array.isArray(parsedTransactions) ? parsedTransactions : [];
  } catch (error) {
    console.log('Error al cargar transacciones:', error);
    return [];
  }
}

async function persistTransactions(transactions) {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.log('Error al guardar transacciones:', error);
  }
}

export async function saveTransaction(transaction, currentTransactions) {
  const updatedTransactions = [transaction, ...currentTransactions];
  await persistTransactions(updatedTransactions);
  return updatedTransactions;
}

export async function deleteTransactionById(transactionId, currentTransactions) {
  const updatedTransactions = currentTransactions.filter(
    (transaction) => transaction.id !== transactionId
  );
  await persistTransactions(updatedTransactions);
  return updatedTransactions;
}
