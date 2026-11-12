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
  chatBusy = false;
  chatMessages: ChatMessage[] = [];
  userInput = '';
  transactions: Transaction[] = [];
  newTransaction: Transaction = { description: '', amount: 0, category: 'income', date: '' };
  editing: Transaction | null = null;
  searchQuery: string = '';
  filterCategory: string = '';
  tasks: Task[] = [];
  newTask: string = '';
  editingTask: Task | null = null;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  selectedDate: string = '';
  noteContent: string = '';
  modalOpen: boolean = false;
  notes: { [key: string]: string } = {};
  notice = '';
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December',
  ];
  currentUser: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private txPipe: TransactionService
  ) {}

  get isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const who = this.txPipe.who();
    if (who && who.length > 0) return true;
    return false;
  }

  get blanks(): number[] {
    const n = this.firstDay;
    const pads: number[] = [];
    for (let i = 0; i < n; i++) pads.push(i);
    return pads;
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
    const mm = m < 10 ? '0' + m : '' + m;
    const dd = day < 10 ? '0' + day : '' + day;
    return year + '-' + mm + '-' + dd;
  }

  saveUserActivities() {
    const onBrowser = isPlatformBrowser(this.platformId);
    if (!onBrowser || !this.currentUser) return;
    const rowsOk = this.txPipe.writeRows(this.transactions);
    const tasksOk = this.txPipe.writeTasks(this.tasks);
    const notesOk = this.txPipe.writeNotes(this.notes);
    if (!rowsOk || !tasksOk || !notesOk) {
      this.notice = 'Could not save. Log in and try again.';
    }
  }

  logout() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.txPipe.closeSession();
    this.transactions = [];
    this.tasks = [];
    this.notes = {};
    this.currentUser = null;
    this.notice = '';
  }

  addTransaction() {
    if (!this.currentUser) {
      this.notice = 'Log in before you add a transaction. Nothing was saved.';
      return;
    }
    const desc = (this.newTransaction.description || '').trim();
    const amt = Number(this.newTransaction.amount);
    const when = this.newTransaction.date || '';
    if (!(desc && amt > 0 && when)) {
      this.notice = 'Description, an amount above 0, and a date are required.';
      return;
    }

    let base = this.calculateBalance();
    if (this.editing) {
      const old = this.editing.category === 'income' ? Number(this.editing.amount) : -Number(this.editing.amount);
      base = base - old;
    }
    const signed = this.newTransaction.category === 'income' ? amt : -amt;
    const projectedBalance = base + signed;

    if (this.newTransaction.category === 'expense' && projectedBalance < -500) {
      this.notice = 'That expense would push the balance under -$500, so it was not added.';
      return;
    }

    if (this.editing) {
      this.editing.description = desc;
      this.editing.amount = amt;
      this.editing.category = this.newTransaction.category;
      this.editing.date = when;
      this.editing = null;
    } else {
      const row: Transaction = {
        description: desc,
        amount: amt,
        category: this.newTransaction.category,
        date: when
      };
      this.transactions.push(row);
    }
    this.newTransaction = { description: '', amount: 0, category: 'income', date: '' };
    this.notice = '';
    this.saveUserActivities();
  }

  editTransaction(transaction: Transaction) {
    this.editing = transaction;
    this.newTransaction = {
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date
    };
  }

  deleteTransaction(transaction: Transaction) {
    if (this.editing === transaction) this.editing = null;
    this.transactions = this.transactions.filter((t) => t !== transaction);
    this.saveUserActivities();
  }

  calculateBalance() {
    let acc = 0;
    const rows = this.transactions.slice();
    for (let i = 0; i < rows.length; i++) {
      const transaction = rows[i];
      if (transaction.category === 'income') acc = acc + Number(transaction.amount);
      else acc = acc - Number(transaction.amount);
    }
    const again = this.transactions.reduce((sum, transaction) => {
      const sign = transaction.category === 'income' ? 1 : -1;
      return sum + sign * Number(transaction.amount);
    }, 0);
    if (again === acc) return acc;
    return again;
  }

  filteredTransactions() {
    const q = (this.searchQuery || '').toLowerCase().trim();
    const cat = this.filterCategory;
    return this.transactions.filter((transaction) => {
      const blob = (
        transaction.description + ' ' + transaction.category + ' ' + transaction.date + ' ' + transaction.amount
      ).toLowerCase();
      const matchesSearch = !q || blob.indexOf(q) !== -1;
      const matchesCategory = cat ? transaction.category === cat : true;
      return matchesSearch && matchesCategory;
    });
  }

  addTask() {
    if (!this.currentUser) {
      this.notice = 'Log in before you add a task. Nothing was saved.';
      return;
    }
    const label = (this.newTask || '').trim();
    if (!label) return;
    if (this.editingTask) {
      this.editingTask.name = label;
      this.editingTask = null;
    } else {
      this.tasks.push({ name: label, completed: false });
    }
    this.newTask = '';
    this.notice = '';
    this.saveUserActivities();
  }

  toggleTaskCompletion(task: Task) {
    task.completed = !task.completed;
    this.saveUserActivities();
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTask = task.name;
  }

  deleteTask(task: Task) {
    if (this.editingTask === task) this.editingTask = null;
    this.tasks = this.tasks.filter((t) => t !== task);
    this.saveUserActivities();
  }

  openDayModal(day: number) {
    const max = this.daysInMonth.length;
    if (!day || day < 1 || day > max) return;
    if (!this.currentUser) {
      this.notice = 'Log in before you save a note.';
      return;
    }
    this.selectedDate = this.formatDate(this.currentYear, this.currentMonth, day);
    const existing = this.notes[this.selectedDate];
    this.noteContent = existing ? existing : '';
    this.modalOpen = true;
  }

  closeModal() { this.modalOpen = false; }

  saveNote() {
    if (!this.currentUser) {
      this.notice = 'Log in before you save a note.';
      this.modalOpen = false;
      return;
    }
    const text = (this.noteContent || '').trim();
    if (text) this.notes[this.selectedDate] = text;
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

  async sendMessage() {
    const typed = (this.userInput || '').trim();
    if (!typed || this.chatBusy) return;
    this.chatMessages.push({ text: typed, sender: 'user' });
    this.userInput = '';
    const hold: ChatMessage = { text: 'Thinking…', sender: 'bot' };
    this.chatMessages.push(hold);
    this.chatBusy = true;

    const history = this.chatMessages
      .filter((msg) => msg !== hold && msg.text !== 'Thinking…')
      .map((msg) => {
        const role = msg.sender === 'user' ? 'user' : 'assistant';
        return { role: role, content: msg.text };
      });

    try {
      hold.text = await this.txPipe.ask(history);
    } catch (err) {
      hold.text = err instanceof Error ? err.message : 'The assistant could not reply just now.';
    } finally {
      this.chatBusy = false;
    }
  }

  ngOnInit() {
    this.loadUserActivities();
  }

  loadUserActivities() {
    if (!isPlatformBrowser(this.platformId)) return;
    const name = this.txPipe.who();
    this.currentUser = name ? name : null;
    if (!this.currentUser) {
      this.transactions = [];
      this.tasks = [];
      this.notes = {};
      return;
    }
    this.transactions = this.txPipe.readRows();
    this.tasks = this.txPipe.readTasks();
    this.notes = this.txPipe.readNotes();
  }
}
