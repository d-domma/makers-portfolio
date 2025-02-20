import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  standalone: true,
  styleUrls: ['./bot.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class BotComponent {
  messages = [
    { text: 'Hi there! What type of building are you looking to design? Please provide a description or any details you have in mind.' }
  ];
  userInput = '';
  isThinking = false;
  currentQuestion = true;
  questionAsked = false;
  questionText = '';
  buildingLink = '';
  buildingType = '';
  isLocationAsked = false;
  isPreferencesAsked = false;
  location = '';
  preferences = '';
  questionStep = 0;

  async processInput() {
    const typed = (this.userInput || '').trim();
    if (!typed || this.isThinking) return;

    this.messages.push({ text: '<strong>You:</strong> ' + this.escape(typed) });
    this.userInput = '';
    this.isThinking = true;
    this.currentQuestion = false;

    const history: { role: string; content: string }[] = [];
    for (let i = 0; i < this.messages.length; i++) {
      const raw = this.plain(this.messages[i].text);
      let role = 'assistant';
      let content = raw;
      if (raw.indexOf('You:') === 0) {
        role = 'user';
        content = raw.replace(/^You:\s*/, '');
      } else {
        content = raw.replace(/^Bot:\s*/, '');
      }
      history.push({ role: role, content: content });
    }

    let note = '';
    try {
      note = localStorage.getItem('lastSite') || '';
    } catch (err) {
      note = '';
    }

    const lines = [];
    lines.push('You help inside this design tool. Home has a form: building type, state, cost in dollars, size in sq ft, rooms, then Generate Design. Generate Design uses OpenStreetMap, Open-Meteo, Overpass, and a scikit-learn knn with k=4. Labels are shade, storm, infill, green, heat. If the person lists a state and numbers, treat them as state, cost, size, rooms and tell them to put those on the Home form and press Generate Design. Plain text, short, no markdown. Do not invent a listings database.');
    if (note) lines.push('Last site reading: ' + note.slice(0, 400));
    const tail = history.slice(-4);
    for (let i = 0; i < tail.length; i++) {
      const who = tail[i].role === 'user' ? 'Person' : 'Helper';
      let bit = tail[i].content || '';
      if (bit.length > 360) bit = bit.slice(0, 360);
      lines.push(who + ': ' + bit);
    }
    lines.push('Answer the last Person line.');
    let packed = lines.join('\n');
    if (packed.length > 1500) packed = packed.slice(packed.length - 1500);

    let content = '';
    try {
      const res = await fetch('/api/say/' + encodeURIComponent(packed));
      if (!res.ok) throw new Error('no reply');
      content = (await res.text()).trim().split('**').join('');
    } catch (err) {
      content = '';
    }
    if (!content) {
      try {
        const again = await fetch('/api/say/' + encodeURIComponent(packed));
        if (again.ok) content = (await again.text()).trim().split('**').join('');
      } catch (err2) {
        content = '';
      }
    }
    if (!content) {
      this.messages.push({ text: '<strong>Bot:</strong> The helper did not answer. Try again in a moment.' });
    } else {
      this.messages.push({ text: '<strong>Bot:</strong> ' + this.escape(content).split('\n').join('<br>') });
    }

    this.isThinking = false;
    this.currentQuestion = true;
  }

  plain(html: string) {
    return String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  escape(s: string) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
