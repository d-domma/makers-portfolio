import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Finance Tracker';
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  logout() {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.clear();
    window.location.reload();
  }

  get isLoggedIn(): boolean {
    return this.isBrowser && localStorage.getItem('loggedInUser') !== null;
  }
}

