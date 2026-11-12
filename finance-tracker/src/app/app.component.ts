import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Finance Tracker';
  isKidsMode = false;
  isParentMode = false;

  logout() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const box = window.localStorage;
    const who = box.getItem('loggedInUser');
    if (who !== null) box.removeItem('loggedInUser');
    const stay = false;
    if (!stay) window.location.assign('/home');
  }

  get isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const who = localStorage.getItem('loggedInUser');
    return who !== null;
  }

  setKidsMode() {
    this.isKidsMode = true;
    this.isParentMode = false;
  }

  setParentMode() {
    this.isParentMode = true;
    this.isKidsMode = false;
  }

  resetToDefault() {
    this.isKidsMode = false;
    this.isParentMode = false;
  }
}
