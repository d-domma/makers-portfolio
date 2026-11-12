import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../filter.pipe';
import { TransactionService } from '../transaction.service';

interface KidTask {
  name: string;
  reward: number;
  inProgress: boolean;
  timeRemaining: number;
  duration: number;
  startedAt: number;
}

@Component({
  selector: 'app-kids-mode',
  standalone: true,
  templateUrl: './kids-mode.component.html',
  styleUrls: ['./kids-mode.component.scss'],
  imports: [CommonModule, FormsModule, FilterPipe]
})
export class KidsModeComponent implements OnInit, OnDestroy {
  balance = 100;
  productQuery = '';
  notice = '';
  private clocks: any[] = [];

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

  tasks: KidTask[] = [
    { name: 'Clean Room', reward: 10, inProgress: false, timeRemaining: 0, duration: 10, startedAt: 0 },
    { name: 'Do Homework', reward: 20, inProgress: false, timeRemaining: 0, duration: 7200, startedAt: 0 },
    { name: 'Help Parents', reward: 15, inProgress: false, timeRemaining: 0, duration: 2700, startedAt: 0 },
    { name: 'Read a Book', reward: 5, inProgress: false, timeRemaining: 0, duration: 2700, startedAt: 0 },
    { name: 'Wash Dishes', reward: 10, inProgress: false, timeRemaining: 0, duration: 1200, startedAt: 0 },
    { name: 'Take Out Trash', reward: 5, inProgress: false, timeRemaining: 0, duration: 300, startedAt: 0 },
    { name: 'Feed Pets', reward: 7, inProgress: false, timeRemaining: 0, duration: 300, startedAt: 0 },
    { name: 'Organize Toys', reward: 8, inProgress: false, timeRemaining: 0, duration: 900, startedAt: 0 },
  ];

  constructor(private book: TransactionService) {}

  ngOnInit() {
    const saved = this.book.readKids();
    if (!saved) {
      this.notice = this.book.who() ? '' : 'Log in if you want the balance and the toys to still be here next time.';
      return;
    }
    if (typeof saved.balance === 'number') this.balance = saved.balance;
    if (Array.isArray(saved.purchased)) this.purchasedItems = saved.purchased;
    const running = saved.running && typeof saved.running === 'object' ? saved.running : {};
    this.tasks.forEach((task) => {
      const started = Number(running[task.name] || 0);
      if (!started) return;
      task.startedAt = started;
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = task.duration - elapsed;
      if (left <= 0) {
        this.balance = this.balance + task.reward;
        task.startedAt = 0;
        task.inProgress = false;
        task.timeRemaining = 0;
      } else {
        task.inProgress = true;
        task.timeRemaining = left;
        this.arm(task);
      }
    });
    this.persist();
  }

  ngOnDestroy() {
    this.clocks.forEach((id) => clearInterval(id));
    this.clocks = [];
  }

  buyProduct(product: { name: string; price: number }) {
    const cost = Number(product.price);
    const have = this.balance;
    if (have >= cost) {
      this.balance = have - cost;
      const bought = { name: product.name, price: cost };
      this.purchasedItems = this.purchasedItems.concat([bought]);
      this.notice = '';
      this.persist();
    } else {
      this.notice = 'Not enough balance for ' + product.name + '.';
    }
  }

  startTask(task: KidTask) {
    if (task.inProgress) return;
    task.inProgress = true;
    task.startedAt = Date.now();
    task.timeRemaining = task.duration;
    this.arm(task);
    this.persist();
  }

  private arm(task: KidTask) {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - task.startedAt) / 1000);
      const left = task.duration - elapsed;
      task.timeRemaining = left > 0 ? left : 0;
      if (left <= 0) {
        this.balance = this.balance + task.reward;
        task.inProgress = false;
        task.startedAt = 0;
        clearInterval(timer);
        this.persist();
      }
    }, 1000);
    this.clocks.push(timer);
  }

  private persist() {
    if (!this.book.who()) return;
    const running: { [key: string]: number } = {};
    this.tasks.forEach((task) => {
      if (task.startedAt) running[task.name] = task.startedAt;
    });
    this.book.writeKids({
      balance: this.balance,
      purchased: this.purchasedItems,
      running: running
    });
  }
}
