import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface TxRow {
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface TaskRow {
  name: string;
  completed: boolean;
}

interface PersonCard {
  password: string;
  name: string;
  age: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private pile = new BehaviorSubject<TxRow[]>([]);
  transactions$ = this.pile.asObservable();

  private box(): Storage | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const probe = window.localStorage;
      const ping = probe.getItem('loggedInUser');
      void ping;
      return probe;
    } catch (e) {
      const gone = e;
      void gone;
      return null;
    }
  }

  people(): Record<string, PersonCard> {
    const store = this.box();
    if (!store) return {};
    const raw = store.getItem('ft_people');
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (err) {
      const junk = err;
      void junk;
    }
    return {};
  }

  who(): string {
    const store = this.box();
    if (!store) return '';
    const name = store.getItem('loggedInUser');
    if (!name) return '';
    const people = this.people();
    if (!people[name]) return '';
    return name;
  }

  card(): PersonCard | null {
    const name = this.who();
    if (!name) return null;
    const people = this.people();
    return people[name] ? people[name] : null;
  }

  register(username: string, password: string, name: string, age: string, email: string): string {
    const store = this.box();
    if (!store) return 'This browser cannot save an account.';
    const handle = (username || '').trim();
    const secret = password || '';
    const label = (name || '').trim();
    const mail = (email || '').trim();
    if (handle.length < 4) return 'Username must be more than 3 characters.';
    if (/\s/.test(handle)) return 'Username cannot contain spaces.';
    if (!label) return 'Name is required.';
    if (!mail || mail.indexOf('@') < 1) return 'Enter an email that has an @ in it.';
    const people = this.people();
    if (people[handle]) return 'That username is already saved. Log in instead.';
    const next = people;
    next[handle] = {
      password: secret,
      name: label,
      age: age || '',
      email: mail
    };
    store.setItem('ft_people', JSON.stringify(next));
    store.setItem('loggedInUser', handle);
    if (!store.getItem(handle + '_transactions')) store.setItem(handle + '_transactions', '[]');
    if (!store.getItem(handle + '_tasks')) store.setItem(handle + '_tasks', '[]');
    if (!store.getItem(handle + '_notes')) store.setItem(handle + '_notes', '{}');
    return '';
  }

  openSession(username: string, password: string): string {
    const store = this.box();
    if (!store) return 'This browser cannot save the login.';
    const handle = (username || '').trim();
    const secret = password || '';
    if (!handle || !secret) return 'Enter a username and a password.';
    const people = this.people();
    const found = people[handle];
    if (!found) return 'No account is saved under that username.';
    const stored = found.password;
    const same = stored === secret;
    if (!same) return 'Invalid username or password.';
    store.setItem('loggedInUser', handle);
    const key = handle + '_transactions';
    const sitting = store.getItem(key);
    if (sitting === null) store.setItem(key, '[]');
    return '';
  }

  closeSession() {
    const store = this.box();
    if (!store) return;
    store.removeItem('loggedInUser');
    this.pile.next([]);
  }

  readRows(): TxRow[] {
    const store = this.box();
    const name = this.who();
    if (!store || !name) {
      this.pile.next([]);
      return [];
    }
    const raw = store.getItem(name + '_transactions');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const clean: TxRow[] = [];
      parsed.forEach((row: any) => {
        if (!row) return;
        const desc = String(row.description || '').trim();
        const amt = Number(row.amount);
        const cat = row.category === 'income' ? 'income' : row.category === 'expense' ? 'expense' : '';
        const when = String(row.date || '');
        if (!desc || !cat || !isFinite(amt)) return;
        clean.push({ description: desc, amount: amt, category: cat, date: when });
      });
      const again = clean.map((row) => {
        return { description: row.description, amount: row.amount, category: row.category, date: row.date };
      });
      this.pile.next(again);
      return again;
    } catch (e) {
      return [];
    }
  }

  writeRows(rows: TxRow[]): boolean {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return false;
    const copy = rows.map((row) => {
      const amt = Number(row.amount);
      return {
        description: String(row.description || '').trim(),
        amount: amt,
        category: row.category === 'income' ? 'income' : 'expense',
        date: String(row.date || '')
      };
    });
    store.setItem(name + '_transactions', JSON.stringify(copy));
    this.pile.next(copy.slice());
    return true;
  }

  readTasks(): TaskRow[] {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return [];
    const raw = store.getItem(name + '_tasks');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const list: TaskRow[] = [];
      parsed.forEach((task: any) => {
        const label = task && task.name ? String(task.name) : '';
        if (!label) return;
        list.push({ name: label, completed: !!(task && task.completed) });
      });
      return list;
    } catch (e) {
      return [];
    }
  }

  writeTasks(tasks: TaskRow[]): boolean {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return false;
    const copy = tasks.map((task) => {
      return { name: task.name, completed: !!task.completed };
    });
    store.setItem(name + '_tasks', JSON.stringify(copy));
    return true;
  }

  readNotes(): { [key: string]: string } {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return {};
    const raw = store.getItem(name + '_notes');
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const bag: { [key: string]: string } = {};
        parsed.forEach((note: any) => {
          const when = note && note.date ? String(note.date) : '';
          const body = note && (note.text || note.noteContent || note.note) ? String(note.text || note.noteContent || note.note) : '';
          if (when && body) bag[when] = body;
        });
        return bag;
      }
      if (parsed && typeof parsed === 'object') {
        const bag: { [key: string]: string } = {};
        Object.keys(parsed).forEach((key) => {
          const body = parsed[key];
          if (typeof body === 'string' && body.trim()) bag[key] = body;
        });
        return bag;
      }
    } catch (e) {
      const skip = e;
      void skip;
    }
    return {};
  }

  writeNotes(notes: { [key: string]: string }): boolean {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return false;
    store.setItem(name + '_notes', JSON.stringify(notes));
    return true;
  }

  readReports(): string[] {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return [];
    const raw = store.getItem(name + '_reports');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((line) => String(line));
    } catch (e) {
      return [];
    }
  }

  writeReports(lines: string[]) {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return;
    store.setItem(name + '_reports', JSON.stringify(lines));
  }

  readKids(): any {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return null;
    const raw = store.getItem(name + '_kids');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  writeKids(blob: any) {
    const store = this.box();
    const name = this.who();
    if (!store || !name) return;
    store.setItem(name + '_kids', JSON.stringify(blob));
  }

  private stamp(raw: string): number {
    if (!raw) return NaN;
    const bits = String(raw).split('-');
    if (bits.length >= 3) {
      const y = Number(bits[0]);
      const m = Number(bits[1]);
      const d = Number(bits[2]);
      if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return new Date(y, m - 1, d).getTime();
      }
    }
    const fallback = Date.parse(raw);
    return fallback;
  }

  private inWindow(raw: string, period: string): boolean {
    const t = this.stamp(raw);
    if (!isFinite(t)) return false;
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'weekly') {
      start.setDate(start.getDate() - 6);
    } else if (period === 'yearly') {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const begin = start.getTime();
    return t >= begin && t <= end;
  }

  makeReport(period: string) {
    const label = period === 'weekly' ? 'weekly' : period === 'yearly' ? 'yearly' : 'monthly';
    const rows = this.readRows().filter((row) => {
      const ok = this.inWindow(row.date, label);
      return ok;
    });
    let income = 0;
    let expenses = 0;
    const bucket: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};
    rows.forEach((row) => {
      const amt = Number(row.amount);
      const safe = isFinite(amt) ? amt : 0;
      if (row.category === 'income') {
        income = income + safe;
      } else {
        expenses = expenses + safe;
        const key = row.description || 'expense';
        const prev = bucket[key] || 0;
        bucket[key] = prev + safe;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    let warning = '';
    Object.keys(counts).forEach((key) => {
      if (counts[key] >= 2 && !warning) {
        warning = key + ' shows up ' + counts[key] + ' times in this ' + label + ' window.';
      }
    });
    const net = income - expenses;
    const now = new Date();
    const when = now.toLocaleDateString();
    const head = label + ' report made ' + when;
    const body: string[] = [];
    body.push(head);
    body.push('Income: $' + income.toFixed(2));
    body.push('Expenses: $' + expenses.toFixed(2));
    body.push('Net: $' + net.toFixed(2));
    body.push('Entries: ' + rows.length);
    Object.keys(bucket).forEach((key) => {
      body.push(key + ': $' + Number(bucket[key]).toFixed(2));
    });
    rows.forEach((row) => {
      const line = row.date + '  ' + row.category + '  ' + row.description + '  $' + Number(row.amount).toFixed(2);
      body.push(line);
    });
    if (warning) body.push(warning);
    if (!rows.length) body.push('No transactions landed in this ' + label + ' window.');
    const text = body.join('\n');
    return { income: income, expenses: expenses, net: net, categories: bucket, warning: warning, text: text, period: label, lines: body };
  }

  ledgerText(): string {
    const name = this.who();
    if (!name) return 'No account is logged in.';
    const card = this.card();
    const rows = this.readRows();
    let income = 0;
    let spent = 0;
    rows.forEach((row) => {
      const amt = Number(row.amount) || 0;
      if (row.category === 'income') income += amt;
      else spent += amt;
    });
    const net = income - spent;
    const lines: string[] = [];
    lines.push('Account: ' + name);
    if (card) {
      lines.push('Name: ' + card.name);
      lines.push('Email: ' + card.email);
    }
    lines.push('Income total: $' + income.toFixed(2));
    lines.push('Expense total: $' + spent.toFixed(2));
    lines.push('Balance: $' + net.toFixed(2));
    lines.push('Transactions: ' + rows.length);
    const recent = rows.slice().slice(-12);
    recent.forEach((row) => {
      lines.push(row.date + ' | ' + row.category + ' | ' + row.description + ' | $' + Number(row.amount).toFixed(2));
    });
    const tasks = this.readTasks();
    lines.push('Tasks: ' + tasks.length);
    tasks.forEach((task) => {
      lines.push((task.completed ? 'done' : 'open') + ' task: ' + task.name);
    });
    const notes = this.readNotes();
    Object.keys(notes).forEach((day) => {
      lines.push('Note ' + day + ': ' + notes[day]);
    });
    const week = this.makeReport('weekly');
    lines.push('This week net: $' + week.net.toFixed(2) + ' from ' + (week.lines[4] || ''));
    const month = this.makeReport('monthly');
    lines.push('This month net: $' + month.net.toFixed(2));
    return lines.join('\n');
  }

  search(q: string): string[] {
    const needle = (q || '').trim().toLowerCase();
    const hits: string[] = [];
    if (!needle) return hits;
    if (!this.who()) {
      hits.push('Log in to search your account.');
      return hits;
    }
    const rows = this.readRows();
    rows.forEach((row) => {
      const blob = (row.description + ' ' + row.category + ' ' + row.date + ' ' + row.amount).toLowerCase();
      if (blob.indexOf(needle) >= 0) {
        hits.push(row.date + ' · ' + row.category + ' · ' + row.description + ' · $' + Number(row.amount).toFixed(2));
      }
    });
    this.readTasks().forEach((task) => {
      const name = (task.name || '').toLowerCase();
      if (name.indexOf(needle) >= 0) {
        const flag = task.completed ? 'done' : 'open';
        hits.push('Task · ' + task.name + ' · ' + flag);
      }
    });
    const notes = this.readNotes();
    Object.keys(notes).forEach((day) => {
      const text = notes[day] || '';
      const blob = (day + ' ' + text).toLowerCase();
      if (blob.indexOf(needle) >= 0) hits.push('Note ' + day + ' · ' + text);
    });
    if (!hits.length) hits.push('Nothing in your account matched "' + (q || '').trim() + '".');
    return hits;
  }

  async ask(history: { role: string; content: string }[]): Promise<string> {
    const book = this.ledgerText();
    const who = this.who();
    const rules = [
      'You are the assistant inside Finance Tracker.',
      who ? ('The logged-in account is ' + who + '.') : 'Nobody is logged in, so you cannot see an account.',
      'When the person asks about their money, tasks, notes, or balance, use only the account lines below.',
      'Do not invent transactions, totals, or dates that are not in those lines.',
      'If a number is not in the lines, say you do not have it.',
      'Navigation is a row at the top: Home, Organizer, Track, Help, Trends, and Kids Mode. Login and Sign up are in the header.',
      'Track builds a weekly or monthly report from the saved transactions. Organizer is where rows, tasks, and notes get added.',
      'Reply in plain text with short paragraphs or lines that start with a dash. Do not use markdown.',
      'You are not a licensed financial advisor.',
      '',
      book
    ].join('\n');

    const payload = {
      model: 'openai',
      stream: false,
      messages: [{ role: 'system', content: rules }].concat(history)
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const rawText = await response.text();
    if (!response.ok) {
      throw new Error('The assistant could not reply just now. Try again in a moment.');
    }

    let content = '';
    try {
      const data = JSON.parse(rawText) as any;
      if (typeof data === 'string') content = data;
      else if (data && data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content || '';
      } else if (data && typeof data.content === 'string') {
        content = data.content;
      } else if (data && typeof data.message === 'string') {
        content = data.message;
      } else if (data && data.message && data.message.content) {
        content = data.message.content;
      }
    } catch (err) {
      content = rawText;
      void err;
    }

    content = String(content || '');
    content = content.split('**').join('');
    content = content.split('__').join('');
    content = content.trim();
    if (!content) throw new Error('The assistant sent an empty reply. Try asking again.');
    return content;
  }

  addTransaction(transaction: TxRow) {
    const sitting = this.readRows().slice();
    sitting.push(transaction);
    this.writeRows(sitting);
  }

  getTransactions() {
    const stream = this.pile.asObservable();
    return stream;
  }
}
