import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';

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

  constructor(private router: Router, private book: TransactionService) {}

  login() {
    const handle = (this.username || '').trim();
    const secret = this.password || '';
    const msg = this.book.openSession(handle, secret);
    if (msg) {
      this.errorMessage = msg;
      return;
    }
    this.errorMessage = '';
    const next = '/organizer';
    this.router.navigate([next]);
  }
}
