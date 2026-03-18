import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal';
import { TransactionService } from '../../services/transaction';
import { TransactionForm, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction-modal.html',
  styleUrl: './transaction-modal.css'
})
export class TransactionModalComponent {
  modalService = inject(ModalService);
  private txService = inject(TransactionService);

  isEditing = computed(() => !!this.modalService.editingTransaction());

  form = signal<TransactionForm>({
    title: '', amount: null, type: 'expense', category: '',
    date: new Date().toISOString().slice(0, 10), note: ''
  });

  categories = computed(() =>
    this.form().type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  );

  ngDoCheck(): void {
    const editing = this.modalService.editingTransaction();
    if (editing && this.modalService.isOpen()) {
      const current = this.form();
      if (current.title !== editing.title) {
        this.form.set({ title: editing.title, amount: editing.amount, type: editing.type, category: editing.category, date: editing.date, note: editing.note ?? '' });
      }
    } else if (!this.modalService.isOpen() && this.form().title !== '') {
      this._resetForm();
    }
  }

  updateField<K extends keyof TransactionForm>(key: K, value: TransactionForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
    if (key === 'type') this.form.update(f => ({ ...f, category: '' }));
  }

  get formValue() { return this.form(); }

  submit(): void {
    const f = this.form();
    if (!f.title.trim() || !f.amount || !f.category || !f.date) return;
    const payload = { title: f.title.trim(), amount: Number(f.amount), type: f.type, category: f.category, date: f.date, note: f.note || undefined };
    const editing = this.modalService.editingTransaction();
    if (editing) this.txService.updateTransaction(editing.id, payload);
    else this.txService.addTransaction(payload);
    this.modalService.close();
    this._resetForm();
  }

  close(): void { this.modalService.close(); this._resetForm(); }

  private _resetForm(): void {
    this.form.set({ title: '', amount: null, type: 'expense', category: '', date: new Date().toISOString().slice(0, 10), note: '' });
  }
}