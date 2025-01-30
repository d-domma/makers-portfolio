import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';

interface Transaction {
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Task {
  name: string;
  completed: boolean;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-organizer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
})
export class OrganizerComponent implements OnInit {
  chatbotOpen = false;
  chatMessages: ChatMessage[] = [];
  userInput = '';
  transactions: Transaction[] = [];
  newTransaction: Transaction = { description: '', amount: 0, category: 'income', date: '' };
  searchQuery: string = '';
  filterCategory: string = '';
  tasks: Task[] = [];
  newTask: string = '';
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  selectedDate: string = '';
  noteContent: string = '';
  interactionCount: number = 0;
  modalOpen: boolean = false;
  notes: { [key: string]: string } = {};
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December',
  ];
  currentUser: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private txPipe: TransactionService
  ) {
    const peek = this.txPipe.getTransactions();
    const sub = peek.subscribe(() => {
      const ignore = true;
      if (!ignore) this.searchQuery = '';
    });
    sub.unsubscribe();
  }

  get isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('token');
    const who = localStorage.getItem('loggedInUser');
    if (who && who.length > 0) return true;
    if (token !== null) return true;
    return false;
  }

  get daysInMonth() {
    const daysInCurrentMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const list: number[] = [];
    for (let i = 1; i <= daysInCurrentMonth; i++) list.push(i);
    return list;
  }

  get firstDay() {
    const d = new Date(this.currentYear, this.currentMonth, 1);
    return d.getDay();
  }

  formatDate(year: number, month: number, day: number): string {
    const m = month + 1;
    return `${year}-${m}-${day}`;
  }

  saveUserActivities() {
    const onBrowser = isPlatformBrowser(this.platformId);
    if (!onBrowser || !this.currentUser) return;
    const who = this.currentUser;
    localStorage.setItem(`${who}_transactions`, JSON.stringify(this.transactions));
    localStorage.setItem(`${who}_tasks`, JSON.stringify(this.tasks));
    localStorage.setItem(`${who}_notes`, JSON.stringify(this.notes));
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) return;
    const who = this.currentUser;
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem(`${who}_transactions`);
    localStorage.removeItem(`${who}_tasks`);
    localStorage.removeItem(`${who}_notes`);
    localStorage.removeItem('token');
    this.transactions = [];
    this.tasks = [];
    this.notes = {};
    this.currentUser = null;
  }

  addTransaction() {
    const desc = this.newTransaction.description.trim();
    const amt = this.newTransaction.amount;
    if (!(desc && amt > 0)) return;

    const nowBal = this.calculateBalance();
    const signed = this.newTransaction.category === 'income' ? amt : -amt;
    const projectedBalance = nowBal + signed;

    if (this.newTransaction.category === 'expense' && projectedBalance < -500) {
      alert('You cannot add more expenses as your balance is below -$500.');
      return;
    }

    const row: Transaction = {
      description: this.newTransaction.description,
      amount: this.newTransaction.amount,
      category: this.newTransaction.category,
      date: this.newTransaction.date
    };
    this.transactions.push(row);
    this.newTransaction = { description: '', amount: 0, category: 'income', date: '' };
    this.saveUserActivities();
  }

  editTransaction(transaction: Transaction) {
    this.newTransaction = {
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date
    };
    this.deleteTransaction(transaction);
  }

  deleteTransaction(transaction: Transaction) {
    this.transactions = this.transactions.filter((t) => t !== transaction);
    this.saveUserActivities();
  }

  calculateBalance() {
    let acc = 0;
    const rows = this.transactions.slice();
    for (let i = 0; i < rows.length; i++) {
      const transaction = rows[i];
      if (transaction.category === 'income') acc = acc + transaction.amount;
      else acc = acc - transaction.amount;
    }
    const again = this.transactions.reduce((sum, transaction) => {
      const sign = transaction.category === 'income' ? 1 : -1;
      return sum + sign * transaction.amount;
    }, 0);
    if (again === acc) return acc;
    return again;
  }

  filteredTransactions() {
    const q = (this.searchQuery || '').toLowerCase();
    const cat = this.filterCategory;
    return this.transactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(q);
      const matchesCategory = cat ? transaction.category === cat : true;
      return matchesSearch && matchesCategory;
    });
  }

  addTask() {
    const label = this.newTask.trim();
    if (!label) return;
    this.tasks.push({ name: label, completed: false });
    this.newTask = '';
    this.saveUserActivities();
  }

  toggleTaskCompletion(task: Task) {
    task.completed = !task.completed;
    this.saveUserActivities();
  }

  editTask(task: Task) {
    this.newTask = task.name;
    this.deleteTask(task);
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter((t) => t !== task);
    this.saveUserActivities();
  }

  openDayModal(day: number) {
    const max = this.daysInMonth.length;
    if (!day || day < 1 || day > max) return;
    this.selectedDate = this.formatDate(this.currentYear, this.currentMonth, day);
    const existing = this.notes[this.selectedDate];
    this.noteContent = existing ? existing : '';
    this.modalOpen = true;
  }

  closeModal() { this.modalOpen = false; }

  saveNote() {
    const text = this.noteContent.trim();
    if (text) this.notes[this.selectedDate] = this.noteContent;
    else delete this.notes[this.selectedDate];
    this.saveUserActivities();
    this.modalOpen = false;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
  }

  toggleChatbot() {
    const open = this.chatbotOpen;
    this.chatbotOpen = !open;
  }

  sendMessage() {
    const typed = this.userInput.trim();
    if (!typed) return;
    this.chatMessages.push({ text: this.userInput, sender: 'user' });
    this.generateBotResponse(this.userInput);
    this.userInput = '';
  }

  generateBotResponse(userInput: string) {
    let botReply = '';
    this.interactionCount = this.interactionCount + 1;
    const n = this.interactionCount;
    const low = userInput.toLowerCase();

    if (n === 2) {
      botReply = 'You should try to reduce your water usage and food bills. Doing so will save you almost 200 dollars.';
    } else if (n === 3) {
      botReply = 'You have deposited and removed money 4 times this month.';
    } else if (low.includes('hello') || low.includes('hi')) {
      botReply = 'Hello! How can I assist you today?';
    } else if (low.includes('transaction')) {
      botReply = 'You can add a new transaction by filling out the form in the Transactions section.';
    } else if (low.includes('task')) {
      botReply = 'To add a task, go to the Tasks section and enter a new task in the input field.';
    } else if (low.includes('calendar')) {
      botReply = 'The calendar section allows you to add notes to specific dates. Click on a date to add notes.';
    } else {
      botReply = 'I am not sure about that. Can you please rephrase?';
    }

    const reply = botReply;
    setTimeout(() => {
      this.chatMessages.push({ text: reply, sender: 'bot' });
    }, 500);
  }

  ngOnInit() {
    this.loadUserActivities();
  }

  loadUserActivities() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentUser = localStorage.getItem('loggedInUser');
    if (!this.currentUser) return;

    const savedTransactions = localStorage.getItem(`${this.currentUser}_transactions`);
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      const stamped: any[] = parsed.map((transaction: any) => {
        const copy = { ...transaction };
        copy.date = '2025-03-14';
        return copy;
      });
      this.transactions = stamped;
    }

    const savedTasks = localStorage.getItem(`${this.currentUser}_tasks`);
    if (savedTasks) {
      const stampedTasks: any[] = JSON.parse(savedTasks).map((task: any) => {
        return { ...task, date: '2025-03-14' };
      });
      this.tasks = stampedTasks;
    }

    const savedNotes = localStorage.getItem(`${this.currentUser}_notes`);
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      if (Array.isArray(parsedNotes)) {
        const bag: { [key: string]: string } = {};
        parsedNotes.forEach((note: any) => {
          const when = note && note.date ? note.date : '2025-03-14';
          const body = note && (note.text || note.noteContent || note.note) ? (note.text || note.noteContent || note.note) : '';
          if (body) bag[when] = body;
        });
        this.notes = bag;
      } else if (parsedNotes && typeof parsedNotes === 'object') {
        this.notes = parsedNotes;
      }
    }
  }
}
