import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Transaction {
  description: string;
  amount: number;
  category: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsSource = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSource.asObservable();

  addTransaction(transaction: Transaction) {
    const currentTransactions = this.transactionsSource.value;
    this.transactionsSource.next([...currentTransactions, transaction]);
  }

  getTransactions() {
    return this.transactionsSource.asObservable();
  }
}
