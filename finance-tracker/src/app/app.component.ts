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

  logout() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const box = window.localStorage;
    ['loggedInUser', 'username', 'password'].forEach((name) => {
      box.removeItem(name);
    });
    box.clear();
    window.location.reload();
  }

  get isLoggedIn(): boolean {
    const bag = typeof localStorage === 'undefined' ? null : localStorage;
    if (!bag) return false;
    return bag.getItem('loggedInUser') !== null;
  }
}
