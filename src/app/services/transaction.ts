// 

import { Injectable, signal, computed } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { MOCK_TRANSACTIONS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>(
    [...MOCK_TRANSACTIONS].sort((a, b) => b.date.localeCompare(a.date))
  );

  readonly transactions  = this._transactions.asReadonly();
  readonly totalIncome   = computed(() => this._transactions().filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
  readonly totalExpenses = computed(() => this._transactions().filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  readonly balance       = computed(() => this.totalIncome() - this.totalExpenses());
  readonly savingsRate   = computed(() => { const i = this.totalIncome(); return i > 0 ? ((i - this.totalExpenses()) / i) * 100 : 0; });
  readonly recentTransactions = computed(() => this._transactions().slice(0, 7));

  addTransaction(data: Omit<Transaction, 'id'>): void {
    const newTx: Transaction = { ...data, id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
    this._transactions.update(list => [newTx, ...list].sort((a, b) => b.date.localeCompare(a.date)));
  }

  updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): void {
    this._transactions.update(list =>
      list.map(t => t.id === id ? { ...t, ...updates } : t).sort((a, b) => b.date.localeCompare(a.date))
    );
  }

  deleteTransaction(id: string): void {
    this._transactions.update(list => list.filter(t => t.id !== id));
  }

  getById(id: string): Transaction | undefined {
    return this._transactions().find(t => t.id === id);
  }

  getByMonth(year: number, month: number): Transaction[] {
    const m = String(month).padStart(2, '0');
    return this._transactions().filter(t => t.date.startsWith(`${year}-${m}`));
  }

  getMonthlyTotals(): { month: string; income: number; expense: number }[] {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of this._transactions()) {
      const key = t.date.slice(0, 7);
      if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
      const e = map.get(key)!;
      if (t.type === 'income') e.income += t.amount; else e.expense += t.amount;
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v }));
  }

  getCategoryTotals(type: 'income' | 'expense'): { category: string; total: number }[] {
    const map = new Map<string, number>();
    for (const t of this._transactions().filter(x => x.type === type)) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()].sort(([, a], [, b]) => b - a).map(([category, total]) => ({ category, total }));
  }

  getWeeklyTotals(): { week: string; income: number; expense: number }[] {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of this._transactions()) {
      const d = new Date(t.date);
      const ws = new Date(d);
      ws.setDate(d.getDate() - d.getDay());
      const key = ws.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
      const e = map.get(key)!;
      if (t.type === 'income') e.income += t.amount; else e.expense += t.amount;
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, v]) => ({ week, ...v }));
  }
}