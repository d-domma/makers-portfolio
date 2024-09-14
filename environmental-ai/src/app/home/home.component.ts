import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class HomeComponent {
  buildingType = '';
  state = '';
  location = '';
  cost = 0;
  size = 0;
  rooms = 0;
  generatedDesign: any = null;
  benefits = '';
  environmentBenefits = '';
  costReductionSuggestion = '';
  locationSuggestion = '';

  pastDesigns = [
    { name: '2 Story House', imageUrl: 'https://www.tinkercad.com/things/b0Bsg81SFbt/edit' },
    { name: '1 Story House', imageUrl: 'https://www.tinkercad.com/things/b0Bsg81SFbt/edit' },
    { name: 'Apartment Building', imageUrl: 'https://www.tinkercad.com/things/2mxkybK3Imy/edit' },
    { name: 'School', imageUrl: 'https://www.tinkercad.com/things/5ZZUpc2FtjB/edit' },
    { name: 'Rich House', imageUrl: 'https://www.tinkercad.com/things/1IAV9v3fPcf/edit' },
    { name: 'Park', imageUrl: 'https://www.tinkercad.com/things/fjuHENu49RG/edit' },
    { name: 'Shopping Mall', imageUrl: 'https://www.tinkercad.com/things/0n1tO6SLbfU-copy-of-shopping-mall-by-arcostasi/edit' },
    { name: 'Grocery Store', imageUrl: 'https://www.tinkercad.com/things/lDX0ZFgznpI/edit' }
  ];

  stateList = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

  designMap: { [key: string]: { design: any } } = {
    '2-story-house': { design: this.pastDesigns[0] },
    '1-story-house': { design: this.pastDesigns[1] },
    apartment: { design: this.pastDesigns[2] },
    school: { design: this.pastDesigns[3] },
    'rich-house': { design: this.pastDesigns[4] },
    park: { design: this.pastDesigns[5] },
    'shopping-mall': { design: this.pastDesigns[6] },
    'grocery-store': { design: this.pastDesigns[7] }
  };

  onSubmit() {
    const picked = this.designMap[this.buildingType];
    this.generatedDesign = picked ? picked.design : this.pastDesigns[0];
    this.location = this.state;
    this.benefits = 'This ' + this.buildingType + ' is the sample for that type. Nothing about the site is looked up yet.';
    this.environmentBenefits = 'No weather or map count in this version.';
    this.costReductionSuggestion = 'You typed $' + this.cost + ' for ' + this.size + ' sq ft and ' + this.rooms + ' rooms.';
    this.locationSuggestion = 'Suggested Location: ' + (this.state || 'pick a state') + '.';
  }
}
