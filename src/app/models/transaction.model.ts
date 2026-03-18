export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

export interface TransactionForm {
  title: string;
  amount: number | null;
  type: TransactionType;
  category: string;
  date: string;
  note: string;
}

export const EXPENSE_CATEGORIES = [
  'Housing', 'Food & Dining', 'Transport', 'Shopping',
  'Health', 'Entertainment', 'Education', 'Utilities', 'Other'
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'
];

export const CATEGORY_ICONS: Record<string, string> = {
  'Housing':        '🏠',
  'Food & Dining':  '🍽️',
  'Transport':      '🚗',
  'Shopping':       '🛍️',
  'Health':         '💊',
  'Entertainment':  '🎬',
  'Education':      '📚',
  'Utilities':      '⚡',
  'Salary':         '💼',
  'Freelance':      '💻',
  'Investment':     '📈',
  'Business':       '🏢',
  'Gift':           '🎁',
  'Other':          '💰',
};