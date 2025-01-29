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

  citySuggestions = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];

  buildingLinks: Record<string, string[]> = {
    house: ['https://www.tinkercad.com/things/b0Bsg81SFbt/edit'],
    apartment: ['https://www.tinkercad.com/things/2mxkybK3Imy/edit'],
    school: ['https://www.tinkercad.com/things/5ZZUpc2FtjB/edit'],
    'rich house': ['https://www.tinkercad.com/things/1IAV9v3fPcf/edit'],
    park: ['https://www.tinkercad.com/things/fjuHENu49RG/edit'],
    'shopping mall': ['https://www.tinkercad.com/things/0n1tO6SLbfU-copy-of-shopping-mall-by-arcostasi/edit'],
    'grocery store': ['https://www.tinkercad.com/things/lDX0ZFgznpI/edit']
  };

  processInput() {
    const typed = (this.userInput || '').trim();
    if (!typed) return;
    const lower = typed.toLowerCase();
    this.messages.push({ text: '<strong>You:</strong> ' + typed });
    this.userInput = '';
    this.isThinking = true;

    let response = '';
    if (this.questionStep === 0) {
      if (lower.indexOf('house') >= 0) { this.buildingType = 'house'; response = 'House. 1 story or 2?'; }
      else if (lower.indexOf('apartment') >= 0) { this.buildingType = 'apartment'; response = 'Apartment. High-rise or low-rise?'; }
      else if (lower.indexOf('school') >= 0) { this.buildingType = 'school'; response = 'School. Say a city or type done.'; }
      else if (lower.indexOf('park') >= 0) { this.buildingType = 'park'; response = 'Park. Large or small?'; }
      else if (lower.indexOf('mall') >= 0) { this.buildingType = 'shopping mall'; response = 'Mall. Type a city or done.'; }
      else if (lower.indexOf('grocery') >= 0) { this.buildingType = 'grocery store'; response = 'Grocery store. Type done when you want the link.'; }
      else response = 'Say house, apartment, school, park, mall, or grocery.';
      this.questionStep = 1;
    } else if (this.questionStep === 1) {
      response = 'City ideas: ' + this.citySuggestions.join(', ') + '. Type done to get the link.';
      if (lower !== 'done') this.location = typed;
      this.questionStep = 2;
    } else {
      const links = this.buildingLinks[this.buildingType] || [];
      const link = links.length ? links[0] : '';
      response = link ? 'Sample: <a href="' + link + '" target="_blank">' + this.buildingType + '</a>' : 'No link for that.';
      if (this.location) response += ' You said ' + this.location + '.';
      this.questionStep = 0;
      this.buildingType = '';
    }

    const wait = this.questionStep;
    setTimeout(() => {
      this.messages.push({ text: '<strong>Bot:</strong> ' + response });
      this.isThinking = false;
      this.currentQuestion = true;
      void wait;
    }, 400);
  }
}
