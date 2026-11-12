import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {
  filterPeriod: string = 'monthly';
  reports: string[] = [];
  categories: { [key: string]: number } = {};
  summaryIncome: number = 0;
  summaryExpenses: number = 0;
  summaryNet: number = 0;
  summaryGenerated: boolean = false;
  spendingPatternWarning: string = '';
  notice = '';

  constructor(private book: TransactionService) {}

  get categoryKeys() {
    const keys = Object.keys(this.categories);
    return keys;
  }

  get loggedIn(): boolean {
    const name = this.book.who();
    return !!name;
  }

  ngOnInit() {
    const saved = this.book.readReports();
    this.reports = saved.slice();
  }

  generateSummary() {
    if (!this.book.who()) {
      this.notice = 'Log in first. The report is built from the transactions on your account.';
      this.summaryGenerated = false;
      return;
    }
    const period = this.filterPeriod === 'weekly' ? 'weekly' : 'monthly';
    const made = this.book.makeReport(period);
    this.summaryIncome = made.income;
    this.summaryExpenses = made.expenses;
    this.summaryNet = made.net;
    this.categories = made.categories;
    this.spendingPatternWarning = made.warning;
    const packed = made.lines.slice();
    packed.forEach((line) => {
      this.reports.push(line);
    });
    this.reports.push('—');
    this.book.writeReports(this.reports);
    this.summaryGenerated = true;
    this.notice = '';
  }

  clearReports() {
    this.reports = [];
    this.book.writeReports(this.reports);
    this.summaryGenerated = false;
    this.categories = {};
    this.spendingPatternWarning = '';
  }

  downloadReport() {
    const text = this.reports.filter((line) => line !== '—').join('\n');
    if (!text) {
      this.notice = 'Generate a summary before downloading.';
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = 'finance-report-' + stamp + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
