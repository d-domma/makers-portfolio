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

  processInput() {
    const typed = (this.userInput || '').trim();
    if (!typed || this.isThinking) return;
    this.messages.push({ text: '<strong>You:</strong> ' + typed });
    this.userInput = '';
    this.messages.push({ text: '<strong>Bot:</strong> Help is not connected in this version.' });
  }
}
