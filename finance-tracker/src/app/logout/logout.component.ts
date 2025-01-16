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
    const box = localStorage;
    box.removeItem('loggedInUser');
    box.removeItem('username');
    box.removeItem('password');
    const who = box.getItem('loggedInUser');
    box.removeItem(`${who}_transactions`);
    box.removeItem(`${who}_tasks`);
    box.removeItem(`${who}_notes`);
    this.router.navigate(['/login']);
  }
}
