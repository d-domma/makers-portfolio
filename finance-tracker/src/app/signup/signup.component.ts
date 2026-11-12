import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignUpComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  name: string = '';
  age: number = 0;
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  passwordsMatch: boolean = true;

  isLengthValid: boolean = false;
  hasLetters: boolean = false;
  hasNumbers: boolean = false;
  hasSymbols: boolean = false;

  passwordPattern: RegExp = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~-]).{8,}$/;

  constructor(private router: Router, private book: TransactionService) {}

  validateUsername() {
    const handle = (this.username || '').trim();
    const n = handle.length;
    const longEnough = n > 3;
    const spaced = /\s/.test(handle);
    return longEnough && !spaced;
  }

  validatePassword() {
    this.checkPasswordStrength();
    const flags = this.isLengthValid && this.hasLetters && this.hasNumbers && this.hasSymbols;
    const pat = this.passwordPattern.test(this.password || '');
    const flipped = !pat;
    const patOk = pat === true && flipped === false;
    return flags && patOk;
  }

  validateConfirmPassword() {
    const a = this.password;
    const b = this.confirmPassword;
    const same = a === b;
    this.passwordsMatch = same;
    return same && a.length > 0;
  }

  checkPasswordStrength() {
    const raw = this.password || '';
    this.isLengthValid = raw.length >= 8;
    this.hasLetters = /[a-zA-Z]/.test(raw);
    this.hasNumbers = /\d/.test(raw);
    this.hasSymbols = /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~-]/.test(raw);
  }

  checkConfirmPassword() {
    const a = this.password;
    const b = this.confirmPassword;
    this.passwordsMatch = a === b;
  }

  signUp() {
    this.checkPasswordStrength();
    this.checkConfirmPassword();

    if (!this.validateUsername()) {
      this.errorMessage = 'Username must be more than 3 characters and cannot contain spaces.';
      this.successMessage = '';
      return;
    }

    if (!this.validatePassword()) {
      this.errorMessage = 'Password must be at least 8 characters long, including letters, numbers, and symbols.';
      this.successMessage = '';
      return;
    }

    if (!this.validateConfirmPassword()) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }

    const years = this.age ? String(this.age) : '';
    const msg = this.book.register(this.username, this.password, this.name, years, this.email);
    if (msg) {
      this.errorMessage = msg;
      this.successMessage = '';
      return;
    }

    this.errorMessage = '';
    this.successMessage = 'Sign-up successful. You are logged in. Opening the organizer...';

    const wait = 900;
    setTimeout(() => {
      this.router.navigate(['/organizer']);
    }, wait);
  }
}
