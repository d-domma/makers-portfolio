import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bot',
  standalone: true,
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.scss'],
  imports: [CommonModule]
})
export class BotComponent {
  faqOpen: boolean = true;
  private sending = false;

  messages = [
    {
      username: "Assistant",
      text: "Hi. Ask me about budgeting, spending, or how to use Finance Tracker.",
      profilePic: "assets/green.jpg",
      bgColor: "#1e3a5f"
    }
  ];

  toggleFAQ(): void {
    const now = this.faqOpen;
    this.faqOpen = !now;
  }

  goToFAQPage(link: string): void {
    const dest = link;
    window.location.href = dest;
  }

  async sendMessage(): Promise<void> {
    const messageInput = document.getElementById("userMessage") as HTMLInputElement | null;
    const text = messageInput?.value.trim() ?? "";
    if (!text || this.sending) return;

    const history = this.messages.map((message) => {
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
      reply.text = await this.ask(copy);
    } catch (err) {
      reply.text = err instanceof Error ? err.message : "The assistant could not reply just now.";
    } finally {
      this.sending = false;
      this.scrollChat();
    }
  }

  private async ask(history: { role: string; content: string }[]): Promise<string> {
    const payload = {
      model: "openai",
      stream: false,
      messages: [
        {
          role: "system",
          content: "You are the help assistant inside Finance Tracker. Help with budgeting, spending, saving, and how to use this app. Navigation links are in a row at the top: Home, Organizer, Track, Help, Trends, and Kids Mode. Login and Sign up are in the header. Trends is a table of live prices for Apple, Tesla, Google, and Amazon. Do not invent menus, swipe gestures, search boxes, or a bottom navigation bar. Reply in plain text with short paragraphs or lines that start with a dash. Do not use markdown. You are not a licensed financial advisor."
        }
      ].concat(history)
    };
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("The assistant could not reply just now. Try again in a moment.");
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    let content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "";
    content = (content || "").split("**").join("");
    content = content.trim();
    if (!content) {
      throw new Error("The assistant sent an empty reply. Try asking again.");
    }
    return content;
  }

  private scrollChat(): void {
    setTimeout(() => {
      const chatSection = document.getElementById("chatSection");
      if (chatSection) chatSection.scrollTop = chatSection.scrollHeight;
    }, 50);
  }
}
