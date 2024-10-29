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

  pins: { [key: string]: number[] } = {
    Georgia: [33.749, -84.388],
    California: [34.052, -118.244],
    Texas: [29.76, -95.37],
    'New York': [40.71, -74.01],
    Florida: [25.77, -80.19],
    Illinois: [41.88, -87.63]
  };

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

  async onSubmit() {
    const picked = this.designMap[this.buildingType];
    this.generatedDesign = picked ? picked.design : this.pastDesigns[0];
    const pin = this.pins[this.state] || [33.749, -84.388];
    let temp = 21, rain = 0, wind = 8;
    try {
      const url = '/api/sky?latitude=' + pin[0] + '&longitude=' + pin[1] + '&current=temperature_2m,precipitation,wind_speed_10m&daily=precipitation_sum&forecast_days=1&timezone=auto';
      const res = await fetch(url);
      const sky = await res.json();
      const cur = sky.current || {};
      temp = Number(cur.temperature_2m);
      wind = Number(cur.wind_speed_10m);
      if (sky.daily && sky.daily.precipitation_sum && sky.daily.precipitation_sum.length) rain = Number(sky.daily.precipitation_sum[0]);
      else rain = Number(cur.precipitation || 0);
      if (Number.isNaN(temp)) temp = 21;
      if (Number.isNaN(rain)) rain = 0;
      if (Number.isNaN(wind)) wind = 8;
    } catch (err) {}

    const place = (this.state || 'Georgia') + ' (fixed pin)';
    this.location = place;
    this.benefits = 'Open-Meteo says ' + temp.toFixed(1) + ' C. The pin is hardcoded for a few states. Everyone else gets the Atlanta pin until nominatim is in.';
    this.environmentBenefits = 'Rain today ' + rain.toFixed(1) + ' mm. Wind ' + wind.toFixed(1) + ' km/h. No map count yet.';
    this.costReductionSuggestion = 'Still just your numbers: $' + this.cost + ', ' + this.size + ' sq ft, ' + this.rooms + ' rooms.';
    this.locationSuggestion = 'Suggested Location: ' + place + '.';
  }
}
