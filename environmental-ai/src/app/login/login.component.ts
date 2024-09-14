/*import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  login() {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (this.username === savedUsername && this.password === savedPassword) {
      this.errorMessage = '';
      console.log('Login successful');
      this.router.navigate(['/organizer']); // Navigate to the organizer page
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}
  */
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  login() {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (this.username === savedUsername && this.password === savedPassword) {
      this.errorMessage = '';
      console.log('Login successful');

      // Store the logged-in user
      localStorage.setItem('loggedInUser', this.username);

      // Get saved transactions
      const savedTransactions = localStorage.getItem(`${this.username}_transactions`);
      const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];

      // Initialize transactions if none exist
      if (transactions.length === 0) {
        localStorage.setItem(`${this.username}_transactions`, JSON.stringify([
          { description: 'Loans', amount: 500, category: 'expense', date: '2025-02-02' },
          { description: 'Salary', amount: 2000, category: 'income', date: '2025-02-02' },
          { description: 'Gifts', amount: 50, category: 'income', date: '2025-02-02' },
          { description: 'Food and Water Bills', amount: 400, category: 'expense', date: '2025-02-02' },
        ]));
      }

      // Redirect to organizer page
      this.router.navigate(['/organizer']);
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}
