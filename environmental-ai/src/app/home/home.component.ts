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

    let lat = 33.749, lon = -84.388, placeName = this.state || 'Georgia';
    try {
      const q = encodeURIComponent((this.state || 'Georgia') + ', United States');
      const res = await fetch('/api/place?q=' + q + '&format=json&limit=1');
      const hits = await res.json();
      if (hits && hits[0] && hits[0].lat) {
        lat = Number(hits[0].lat); lon = Number(hits[0].lon);
        placeName = hits[0].display_name || placeName;
      }
    } catch (err) {}

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
    } catch (err) {}

    let parks = 0, woods = 0, buildings = 0;
    try {
      const parkQ = '[out:json][timeout:25];(way["leisure"="park"](around:1800,' + lat + ',' + lon + ');way["natural"="wood"](around:1800,' + lat + ',' + lon + '););out tags;';
      const parkRes = await fetch('/api/ground', { method: 'POST', body: parkQ });
      const parkJson = await parkRes.json();
      const els = parkJson.elements || [];
      for (let i = 0; i < els.length; i++) {
        const tags = els[i].tags || {};
        if (tags.leisure === 'park') parks++;
        else if (tags.natural === 'wood') woods++;
      }
      const bldQ = '[out:json][timeout:25];way["building"](around:650,' + lat + ',' + lon + ');out count;';
      const bldRes = await fetch('/api/ground', { method: 'POST', body: bldQ });
      const bldJson = await bldRes.json();
      const first = bldJson.elements && bldJson.elements[0];
      const tags = first && first.tags ? first.tags : {};
      buildings = Number(tags.ways || tags.total || 0);
    } catch (err) {}

    this.location = placeName;
    this.benefits = 'Open-Meteo ' + temp.toFixed(1) + ' C, rain ' + rain.toFixed(1) + ' mm, wind ' + wind.toFixed(1) + ' km/h.';
    this.environmentBenefits = 'Overpass: ' + parks + ' parks, ' + woods + ' woods in 1.8 km, ' + buildings + ' buildings in 650 m. The model is not called yet.';
    this.costReductionSuggestion = '$' + this.cost + ' / ' + this.size + ' sq ft / ' + this.rooms + ' rooms.';
    this.locationSuggestion = 'Suggested Location: ' + placeName + '.';
  }
}
