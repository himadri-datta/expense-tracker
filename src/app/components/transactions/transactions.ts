// 
import { Component, inject, computed, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { TransactionService } from '../../services/transaction.service';
import { TransactionService } from '../../services/transaction';
// import { ModalService } from '../../services/modal.service';
import { ModalService } from '../../services/modal';
import { Transaction, CATEGORY_ICONS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../models/transaction.model';
// import { ModalService } from '../../services/modal.service';
// import { Transaction, CATEGORY_ICONS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent {
  private txService    = inject(TransactionService);
  private modalService = inject(ModalService);

  categoryIcons = CATEGORY_ICONS;

  searchQuery     = signal('');
  filterType      = signal<'all' | 'income' | 'expense'>('all');
  filterCat       = signal('');
  sortBy          = signal<'date' | 'amount'>('date');
  sortDir         = signal<'asc' | 'desc'>('desc');
  confirmDeleteId = signal<string | null>(null);

  allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].filter((v, i, a) => a.indexOf(v) === i);

  readonly filtered = computed(() => {
    let list = this.txService.transactions();
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    if (this.filterType() !== 'all') list = list.filter(t => t.type === this.filterType());
    if (this.filterCat()) list = list.filter(t => t.category === this.filterCat());
    const dir = this.sortDir() === 'desc' ? -1 : 1;
    return [...list].sort((a, b) =>
      this.sortBy() === 'amount' ? (a.amount - b.amount) * dir : a.date.localeCompare(b.date) * dir
    );
  });

  readonly filteredIncome   = computed(() => this.filtered().filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
  readonly filteredExpenses = computed(() => this.filtered().filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));

  openAdd(): void { this.modalService.openAdd(); }
  openEdit(tx: Transaction): void { this.modalService.openEdit(tx); }
  confirmDelete(id: string): void { this.confirmDeleteId.set(id); }
  cancelDelete(): void { this.confirmDeleteId.set(null); }
  deleteTransaction(id: string): void { this.txService.deleteTransaction(id); this.confirmDeleteId.set(null); }

  toggleSort(col: 'date' | 'amount'): void {
    if (this.sortBy() === col) this.sortDir.update(d => d === 'desc' ? 'asc' : 'desc');
    else { this.sortBy.set(col); this.sortDir.set('desc'); }
  }

  clearFilters(): void { this.searchQuery.set(''); this.filterType.set('all'); this.filterCat.set(''); }

  exportCSV(): void {
    const rows = [['Date','Title','Type','Category','Amount','Note'], ...this.filtered().map(t => [t.date, t.title, t.type, t.category, t.amount.toString(), t.note ?? ''])];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  exportPDF(): void {
    const win = window.open('', '_blank')!;
    const rows = this.filtered().map(t =>
      `<tr><td>${t.date}</td><td>${t.title}</td><td style="color:${t.type==='income'?'#10b981':'#f43f5e'}">${t.type}</td><td>${t.category}</td><td>$${t.amount.toFixed(2)}</td><td>${t.note??''}</td></tr>`
    ).join('');
    win.document.write(`<html><head><title>Transactions</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f5f5f5;padding:8px 12px;text-align:left;border-bottom:2px solid #ddd}td{padding:7px 12px;border-bottom:1px solid #eee}</style></head><body><h2>SpendWise – Transactions</h2><table><thead><tr><th>Date</th><th>Title</th><th>Type</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:16px;font-size:13px"><strong>Income:</strong> $${this.filteredIncome().toFixed(2)} | <strong>Expenses:</strong> $${this.filteredExpenses().toFixed(2)} | <strong>Net:</strong> $${(this.filteredIncome()-this.filteredExpenses()).toFixed(2)}</p></body></html>`);
    win.document.close(); win.print();
  }
}