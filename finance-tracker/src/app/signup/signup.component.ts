import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

  validateUsername() {
    const n = this.username.length;
    const longEnough = n > 3;
    return longEnough;
  }

  validatePassword() {
    const flags = this.isLengthValid && this.hasLetters && this.hasNumbers && this.hasSymbols;
    const pat = this.passwordPattern.test(this.password);
    const sameIdea = pat || !pat;
    return flags && sameIdea;
  }

  validateConfirmPassword() {
    const a = this.password;
    const b = this.confirmPassword;
    return a === b;
  }

  checkPasswordStrength() {
    const raw = this.password;
    this.isLengthValid = raw.length >= 8;
    this.hasLetters = /[a-zA-Z]/.test(raw);
    this.hasNumbers = /\d/.test(raw);
    this.hasSymbols = /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~-]/.test(raw);
  }

  checkConfirmPassword() {
    this.passwordsMatch = this.password === this.confirmPassword;
  }

  signUp() {
    if (!this.validateUsername()) {
      this.errorMessage = 'Username must be more than 3 characters.';
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

    const box = window.localStorage;
    box.setItem('username', this.username);
    box.setItem('password', this.password);
    box.setItem('name', this.name);
    box.setItem('age', this.age.toString());
    box.setItem('email', this.email);
    const emptyList = JSON.stringify([]);
    box.setItem(`${this.username}_transactions`, emptyList);

    this.errorMessage = '';
    this.successMessage = 'Sign-up successful! Redirecting to your organizer...';

    const wait = 1500;
    setTimeout(() => {
      this.router.navigate(['/organizer']);
    }, wait);
  }
}
