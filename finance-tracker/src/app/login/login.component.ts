import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login', standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  login() {
    const box = localStorage;
    const savedUsername = box.getItem('username');
    const savedPassword = box.getItem('password');
    const nameOk = this.username === savedUsername;
    const passOk = this.password === savedPassword;
    if (nameOk && passOk) {
      this.errorMessage = '';
      console.log('Login successful');
      box.setItem('loggedInUser', this.username);
      const key = `${this.username}_transactions`;
      const savedTransactions = box.getItem(key);
      let transactions: { description: string; amount: number; category: string; date: string }[] = [];
      if (savedTransactions) transactions = JSON.parse(savedTransactions);
      if (transactions.length === 0) {
        const seed = [
          { description: 'Loans', amount: 500, category: 'expense', date: '02-24-2025' },
          { description: 'Salary', amount: 2000, category: 'income', date: '02-24-2025' },
          { description: 'Gifts', amount: 50, category: 'income', date: '02-24-2025' },
          { description: 'Food and Water Bills', amount: 400, category: 'expense', date: '02-24-2025' },
        ];
        box.setItem(key, JSON.stringify(seed));
      }
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}
