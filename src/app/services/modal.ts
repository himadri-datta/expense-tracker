// 

import { Injectable, signal } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly isOpen = signal(false);
  readonly editingTransaction = signal<Transaction | null>(null);

  openAdd(): void { this.editingTransaction.set(null); this.isOpen.set(true); }
  openEdit(transaction: Transaction): void { this.editingTransaction.set(transaction); this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); this.editingTransaction.set(null); }
}