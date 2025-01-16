import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root', standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Finance Tracker';

  logout() {
    if (typeof localStorage === 'undefined') return;
    const box = localStorage;
    box.removeItem('loggedInUser');
    box.removeItem('username');
    box.removeItem('password');
    box.clear();
    window.location.reload();
  }

  get isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const who = localStorage.getItem('loggedInUser');
    return who !== null;
  }
}
