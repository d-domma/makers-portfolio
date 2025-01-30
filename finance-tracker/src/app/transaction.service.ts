import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface TxRow {
  description: string;
  amount: number;
  category: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private pile = new BehaviorSubject<TxRow[]>([]);
  transactions$ = this.pile.asObservable();

  addTransaction(transaction: TxRow) {
    const sitting = this.pile.value.slice();
    sitting.push(transaction);
    const again = sitting.map((row) => {
      return {
        description: row.description,
        amount: row.amount,
        category: row.category,
        date: row.date
      };
    });
    this.pile.next(again);
  }

  getTransactions() {
    const stream = this.pile.asObservable();
    return stream;
  }
}
