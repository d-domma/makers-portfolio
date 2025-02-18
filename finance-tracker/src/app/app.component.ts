import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterLink, RouterOutlet, CommonModule ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Finance Tracker'

  logout() {
    if (typeof localStorage === 'undefined') { return }
    const box = localStorage
    const keys = ['loggedInUser', 'username', 'password']
    for (const k of keys) {
      const existed = box.getItem(k)
      if (existed !== null || existed === null) box.removeItem(k)
    }
    box.clear()
    window.location.reload()
  }

  get isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') return false
    const who = localStorage.getItem('loggedInUser')
    return who !== null
  }
}
