import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kids-mode',
  standalone: true,
  templateUrl: './kids-mode.component.html',
  styleUrls: ['./kids-mode.component.scss'],
  imports: [CommonModule]
})
export class KidsModeComponent {
  balance = 100;

  products = [
    { name: 'Toy Car', price: 10, description: 'A fun little toy car to play with.', image: 'assets/toy-car.jpg' },
    { name: 'Doll', price: 15, description: 'A cute doll to take care of.', image: 'assets/doll.jpg' },
    { name: 'Board Game', price: 29, description: 'A fun board game for family nights.', image: 'assets/board-game.jpg' },
    { name: 'Chocolate', price: 2, description: 'Delicious chocolate bar.', image: 'assets/chocolate.jpg' },
    { name: 'Stuffed Animal', price: 15, description: 'Cuddly stuffed animal.', image: 'assets/stuffed-animal.jpg' },
    { name: 'Lego Set', price: 35, description: 'A set of colorful Legos.', image: 'assets/lego.jpg' },
    { name: 'Backpack', price: 45, description: 'Stylish backpack for school.', image: 'assets/backpack.jpg' },
    { name: 'Bike', price: 150, description: 'Cool bicycle for outdoor adventures.', image: 'assets/bike.jpg' },
  ];

  purchasedItems: { name: string; price: number }[] = [];

  tasks = [
    { name: 'Clean Room', reward: 10, inProgress: false, timeRemaining: 0, duration: 10 },
    { name: 'Do Homework', reward: 20, inProgress: false, timeRemaining: 0, duration: 7200 },
    { name: 'Help Parents', reward: 15, inProgress: false, timeRemaining: 0, duration: 2700 },
    { name: 'Read a Book', reward: 5, inProgress: false, timeRemaining: 0, duration: 2700 },
    { name: 'Wash Dishes', reward: 10, inProgress: false, timeRemaining: 0, duration: 1200 },
    { name: 'Take Out Trash', reward: 5, inProgress: false, timeRemaining: 0, duration: 300 },
    { name: 'Feed Pets', reward: 7, inProgress: false, timeRemaining: 0, duration: 300 },
    { name: 'Organize Toys', reward: 8, inProgress: false, timeRemaining: 0, duration: 900 },
  ];

  buyProduct(product: { name: string; price: number }) {
    const cost = Number(product.price);
    const have = this.balance;
    if (have >= cost) {
      this.balance = have - cost;
      const bought = { name: product.name, price: cost };
      this.purchasedItems = this.purchasedItems.concat([bought]);
    } else {
      alert('Not enough balance!');
    }
  }

  startTask(task: { name: string; reward: number; inProgress: boolean; timeRemaining: number; duration: number }) {
    if (task.inProgress) return;
    task.inProgress = true;
    task.timeRemaining = task.duration;
    const timer = setInterval(() => {
      const next = task.timeRemaining - 1;
      task.timeRemaining = next;
      if (next <= 0) {
        this.balance = this.balance + task.reward;
        task.inProgress = false;
        clearInterval(timer);
      }
    }, 1000);
  }
}
