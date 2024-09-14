/*
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
  errorMessage: string = '';
  successMessage: string = '';

  passwordPattern: RegExp = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/;

  constructor(private router: Router) {}

  validateUsername() {
    return this.username.length > 3;
  }

  validatePassword() {
    return this.passwordPattern.test(this.password);
  }

  validateConfirmPassword() {
    return this.password === this.confirmPassword;
  }

  signUp() {
    if (!this.validateUsername()) {
      this.errorMessage = 'Username must be more than 3 characters.';
      this.successMessage = '';
      return;
    }

    if (!this.validatePassword()) {
      this.errorMessage = 'Password must be at least 8 characters long and include letters, numbers, and symbols.';
      this.successMessage = '';
      return;
    }

    if (!this.validateConfirmPassword()) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }

    localStorage.setItem('username', this.username);
    localStorage.setItem('password', this.password);
    
    // Store an empty transactions array for the user
    localStorage.setItem(`${this.username}_transactions`, JSON.stringify([]));

    this.errorMessage = '';
    this.successMessage = 'Sign-up successful! Redirecting to your organizer...';

    setTimeout(() => {
      this.router.navigate(['/organizer']);
    }, 1500);
  }
}
*/
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
    return this.username.length > 3;
  }

  validatePassword() {
    return this.isLengthValid && this.hasLetters && this.hasNumbers && this.hasSymbols;
  }

  validateConfirmPassword() {
    return this.password === this.confirmPassword;
  }

  checkPasswordStrength() {
    this.isLengthValid = this.password.length >= 8;
    this.hasLetters = /[a-zA-Z]/.test(this.password);
    this.hasNumbers = /\d/.test(this.password);
    this.hasSymbols = /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~-]/.test(this.password);
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

    // Store user information in localStorage
    localStorage.setItem('username', this.username);
    localStorage.setItem('password', this.password);
    localStorage.setItem('name', this.name);
    localStorage.setItem('age', this.age.toString());
    localStorage.setItem('email', this.email);

    // Store an empty transactions array for the user
    localStorage.setItem(`${this.username}_transactions`, JSON.stringify([]));

    this.errorMessage = '';
    this.successMessage = 'Sign-up successful! Redirecting to your organizer...';

    setTimeout(() => {
      this.router.navigate(['/organizer']);
    }, 1500);
  }
}
