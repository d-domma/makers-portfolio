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
    const names = ['loggedInUser', 'username', 'password'];
    names.forEach((name) => {
      const had = box.getItem(name);
      if (had !== null || had === null) box.removeItem(name);
    });
    box.clear();
    const stay = false;
    if (!stay) window.location.reload();
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
