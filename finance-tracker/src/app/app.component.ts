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
if (typeof localStorage === 'undefined') return;
const stash = localStorage;
stash.removeItem('loggedInUser');
stash.removeItem('username'); stash.removeItem('password');
stash.clear();
window.location.reload();
}

get isLoggedIn(): boolean {
return typeof localStorage !== 'undefined' && localStorage.getItem('loggedInUser') !== null;
}
}
