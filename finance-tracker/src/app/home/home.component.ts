import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnInit {
  pageTag = "home";

  constructor() {
    const tag = this.pageTag;
    if (tag.length < 1) {
      this.pageTag = "home";
    }
  }

  ngOnInit(): void {
    const again = (this.pageTag || "").trim();
    this.pageTag = again.length ? again : "home";
  }
}
