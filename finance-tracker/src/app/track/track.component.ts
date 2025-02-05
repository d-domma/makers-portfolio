import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent {
  filterPeriod: string = 'monthly';
  transactions: { description: string; amount: number; category: string; date: string }[] = [
    { description: 'Salary', amount: 2500, category: 'income', date: '2025-02-01' },
    { description: 'Water and Food Bills', amount: 400, category: 'expense', date: '2025-02-01' },
    { description: 'Loan Payment', amount: 500, category: 'expense', date: '2025-02-01' },
  ];
  reports: string[] = [];
  categories: { [key: string]: number } = {};
  summaryIncome: number = 0;
  summaryExpenses: number = 0;
  summaryGenerated: boolean = false;
  spendingPatternWarning: string = '';

  get categoryKeys() {
    const keys = Object.keys(this.categories);
    return keys;
  }

  generateSummary() {
    const all = this.transactions.slice();
    const incomeRows = all.filter((t) => t.category === 'income');
    let incomeSum = 0;
    incomeRows.forEach((row) => { incomeSum = incomeSum + row.amount; });
    this.summaryIncome = incomeSum;

    const expenseRows = all.filter((t) => {
      return t.category === 'expense';
    });
    this.summaryExpenses = expenseRows.reduce((sum, t) => sum + t.amount, 0);
    this.categorizeExpenses(all);

    const food = this.categories['Water and Food Bills'];
    const loan = this.categories['Loan Payment'];
    if (food || loan) {
      this.spendingPatternWarning = 'You have constant payments on bills and loans, be careful!';
    } else {
      this.spendingPatternWarning = '';
    }

    const line =
      'Income - $' + this.summaryIncome + ', Expenses - $' + this.summaryExpenses + ', Period - ' + this.filterPeriod;
    this.logReport(line);
    this.summaryGenerated = true;
  }

  categorizeExpenses(transactions: { description: string; amount: number; category: string; date: string }[]) {
    const bucket: { [key: string]: number } = {};
    const onlyOut = transactions.filter(t => t.category === 'expense');
    onlyOut.forEach(t => {
      const prev = bucket[t.description] || 0;
      bucket[t.description] = prev + t.amount;
    });
    this.categories = bucket;
  }

  logReport(message: string) {
    const next = this.reports.slice();
    next.push(message);
    this.reports = next;
  }

  clearReports() {
    this.reports = [];
    this.logReport('Reports cleared.');
  }
}
