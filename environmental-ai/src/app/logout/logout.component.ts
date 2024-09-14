import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent {
  constructor(private router: Router) {
    // Remove logged-in user data from localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem(`${localStorage.getItem('loggedInUser')}_transactions`);
    localStorage.removeItem(`${localStorage.getItem('loggedInUser')}_tasks`);
    localStorage.removeItem(`${localStorage.getItem('loggedInUser')}_notes`);

    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
