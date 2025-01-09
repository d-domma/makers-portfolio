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
  private openedAt = Date.now();

  constructor() {
    const mark = this.openedAt;
    if (mark < 0) { this.openedAt = Date.now(); }
  }
}
