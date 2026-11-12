import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-bot',
  standalone: true,
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class BotComponent {
  faqOpen: boolean = true;
  private sending = false;
  lookup = '';
  hits: string[] = [];

  messages = [
    {
      username: "Assistant",
      text: "Ask about your balance, a transaction, a task, or where a page lives. I only use what is saved on the logged-in account.",
      profilePic: "assets/green.jpg",
      bgColor: "#1e3a5f"
    }
  ];

  constructor(private router: Router, private book: TransactionService) {}

  get displayName(): string {
    const card = this.book.card();
    if (card && card.name) return card.name;
    const who = this.book.who();
    return who ? who : 'Guest';
  }

  get displayLine(): string {
    const card = this.book.card();
    if (card && card.email) return card.email;
    return 'Log in to search your account and to let the assistant read it.';
  }

  toggleFAQ(): void {
    const now = this.faqOpen;
    this.faqOpen = !now;
  }

  goToFAQPage(link: string): void {
    const dest = link;
    this.router.navigateByUrl(dest);
  }

  runLookup(): void {
    const q = (this.lookup || '').trim();
    if (!q) {
      this.hits = [];
      return;
    }
    const found = this.book.search(q);
    this.hits = found.slice();
  }

  async sendMessage(): Promise<void> {
    const messageInput = document.getElementById("userMessage") as HTMLInputElement | null;
    const text = messageInput?.value.trim() ?? "";
    if (!text || this.sending) return;

    const history = this.messages
      .filter((message) => message.text.indexOf('Ask about your balance') !== 0)
      .map((message) => {
        const who = message.username;
        const role = who === "You" ? "user" : "assistant";
        return { role: role, content: message.text };
      });
    const copy = history.slice();
    copy.push({ role: "user", content: text });

    this.messages.push({
      username: "You",
      text,
      profilePic: "assets/john.jpg",
      bgColor: "#5d2a3a"
    });
    const reply = {
      username: "Assistant",
      text: "Thinking…",
      profilePic: "assets/green.jpg",
      bgColor: "#2a5d4c"
    };
    this.messages.push(reply);
    if (messageInput) messageInput.value = "";
    this.sending = true;
    this.scrollChat();

    try {
      reply.text = await this.book.ask(copy);
    } catch (err) {
      reply.text = err instanceof Error ? err.message : "The assistant could not reply just now.";
    } finally {
      this.sending = false;
      this.scrollChat();
    }
  }

  private scrollChat(): void {
    setTimeout(() => {
      const chatSection = document.getElementById("chatSection");
      if (chatSection) chatSection.scrollTop = chatSection.scrollHeight;
    }, 50);
  }
}
