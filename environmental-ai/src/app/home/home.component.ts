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

  async onSubmit() {
    const picked = this.designMap[this.buildingType];
    this.generatedDesign = picked ? picked.design : this.pastDesigns[0];

    let lat = 33.749;
    let lon = -84.388;
    let placeName = this.state || 'Georgia';
    try {
      const q = encodeURIComponent((this.state || 'Georgia') + ', United States');
      const res = await fetch('/api/place?q=' + q + '&format=json&limit=1');
      const hits = await res.json();
      if (hits && hits[0] && hits[0].lat) {
        lat = Number(hits[0].lat);
        lon = Number(hits[0].lon);
        placeName = hits[0].display_name || placeName;
      }
    } catch (err) {
      placeName = (this.state || 'Georgia') + ' (nominatim missed)';
    }

    let temp = 21, rain = 0, wind = 8;
    try {
      const url = '/api/sky?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,precipitation,wind_speed_10m&daily=precipitation_sum&forecast_days=1&timezone=auto';
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

    this.location = placeName;
    this.benefits = 'Nominatim put the pin on ' + placeName + '. Open-Meteo has ' + temp.toFixed(1) + ' C.';
    this.environmentBenefits = rain.toFixed(1) + ' mm of rain and wind ' + wind.toFixed(1) + ' km/h. Parks are not counted yet.';
    this.costReductionSuggestion = '$' + this.cost + ', ' + this.size + ' sq ft, ' + this.rooms + ' rooms. Not passed to a model.';
    this.locationSuggestion = 'Suggested Location: ' + placeName + '.';
  }
}
