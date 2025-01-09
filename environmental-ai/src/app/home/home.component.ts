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

  cityName: { [key: string]: string } = {
    Alabama: 'Birmingham', Alaska: 'Anchorage', Arizona: 'Phoenix', Arkansas: 'Little Rock',
    California: 'Los Angeles', Colorado: 'Denver', Connecticut: 'Hartford', Delaware: 'Wilmington',
    Florida: 'Miami', Georgia: 'Atlanta', Hawaii: 'Honolulu', Idaho: 'Boise',
    Illinois: 'Chicago', Indiana: 'Indianapolis', Iowa: 'Des Moines', Kansas: 'Kansas City',
    Kentucky: 'Louisville', Louisiana: 'New Orleans', Maine: 'Portland', Maryland: 'Baltimore',
    Massachusetts: 'Boston', Michigan: 'Detroit', Minnesota: 'Minneapolis', Mississippi: 'Jackson',
    Missouri: 'St. Louis', Montana: 'Billings', Nebraska: 'Omaha', Nevada: 'Las Vegas',
    'New Hampshire': 'Manchester', 'New Jersey': 'Newark', 'New Mexico': 'Albuquerque', 'New York': 'New York',
    'North Carolina': 'Charlotte', 'North Dakota': 'Fargo', Ohio: 'Columbus', Oklahoma: 'Oklahoma City',
    Oregon: 'Portland', Pennsylvania: 'Philadelphia', 'Rhode Island': 'Providence', 'South Carolina': 'Charleston',
    'South Dakota': 'Sioux Falls', Tennessee: 'Nashville', Texas: 'Houston', Utah: 'Salt Lake City',
    Vermont: 'Burlington', Virginia: 'Richmond', Washington: 'Seattle', 'West Virginia': 'Charleston',
    Wisconsin: 'Milwaukee', Wyoming: 'Cheyenne'
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

    let lat = 33.749;
    let lon = -84.388;
    let placeName = this.state || 'Georgia';

    try {
      const town = this.cityName[this.state] || '';
      const q = encodeURIComponent((town ? town + ', ' : '') + (this.state || 'Georgia') + ', United States');
      const res = await fetch('/api/place?q=' + q + '&format=json&limit=1');
      const hits = await res.json();
      if (hits && hits[0] && hits[0].lat) {
        lat = Number(hits[0].lat);
        lon = Number(hits[0].lon);
        placeName = hits[0].display_name || placeName;
      }
    } catch (err) {
      placeName = (this.state || 'Georgia') + ' (map lookup missed, used the Atlanta fallback pin)';
    }

    let temp = 21;
    let rain = 0;
    let wind = 8;
    try {
      const url = '/api/sky?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,precipitation,wind_speed_10m&daily=precipitation_sum&forecast_days=1&timezone=auto';
      const res = await fetch(url);
      const sky = await res.json();
      const cur = sky.current || {};
      temp = Number(cur.temperature_2m);
      wind = Number(cur.wind_speed_10m);
      if (sky.daily && sky.daily.precipitation_sum && sky.daily.precipitation_sum.length) {
        rain = Number(sky.daily.precipitation_sum[0]);
      } else {
        rain = Number(cur.precipitation || 0);
      }
      if (Number.isNaN(temp)) temp = 21;
      if (Number.isNaN(rain)) rain = 0;
      if (Number.isNaN(wind)) wind = 8;
    } catch (err) {
      temp = 21; rain = 0; wind = 8;
    }

    let parks = 0;
    let woods = 0;
    let buildings = 0;
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
    } catch (err) {
      parks = 0; woods = 0;
    }

    try {
      const bldQ = '[out:json][timeout:25];way["building"](around:650,' + lat + ',' + lon + ');out count;';
      const bldRes = await fetch('/api/ground', { method: 'POST', body: bldQ });
      const bldJson = await bldRes.json();
      const first = bldJson.elements && bldJson.elements[0];
      const tags = first && first.tags ? first.tags : {};
      buildings = Number(tags.ways || tags.total || 0);
      if (Number.isNaN(buildings)) buildings = 0;
    } catch (err) {
      buildings = 0;
    }

    const costK = (Number(this.cost) || 0) / 1000;
    const sqft = Number(this.size) || 0;
    const rooms = Number(this.rooms) || 0;
    let kind = 'unknown';
    let neigh = '';
    try {
      const res = await fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: temp, rain: rain, wind: wind,
          parks: parks, buildings: buildings, woods: woods,
          cost_k: costK, sqft: sqft, rooms: rooms
        })
      });
      const guess = await res.json();
      kind = guess.kind || 'unknown';
      const list = guess.neighbors || [];
      const bits = [];
      for (let i = 0; i < list.length; i++) bits.push(list[i].kind);
      neigh = bits.join(', ');
    } catch (err) {
      kind = 'unknown';
      neigh = 'model offline';
    }

    this.location = placeName;
    this.locationSuggestion = placeName + '. Open-Meteo has ' + temp.toFixed(1) + ' C, ' + rain.toFixed(1) + ' mm of rain today, wind ' + wind.toFixed(1) + ' km/h. Overpass counted ' + parks + ' parks and ' + woods + ' woods inside 1.8 km, and ' + buildings + ' buildings inside 650 m. The KNN (k=4, trained on sites.csv) called this ' + kind + '. Nearest logged sites: ' + (neigh || 'none') + '.';

    if (kind === 'shade') {
      this.benefits = 'The closest trained sites were shade sites. For a ' + this.buildingType + ' that means overhangs on the west side and keeping the afternoon rooms off the glass. ' + rooms + ' rooms at ' + sqft + ' sq ft still works if the stair or the hall takes the sun instead of the bedrooms.';
      this.environmentBenefits = 'There are ' + parks + ' parks and ' + woods + ' wooded ways nearby. Leave those and plant the west edge instead of adding more pavement.';
      this.costReductionSuggestion = 'Shade is cheaper than another ton of cooling. At $' + this.cost + ', spend the money on trees and a porch, not a bigger unit.';
    } else if (kind === 'storm') {
      this.benefits = 'This landed in the storm cluster. Rain is ' + rain.toFixed(1) + ' mm today and the wind is ' + wind.toFixed(1) + ' km/h, so the ' + this.buildingType + ' wants a simple roof and the doors up off the low side.';
      this.environmentBenefits = parks + ' parks showed up on Overpass. Do not dump the roof water into them. Hold it on the lot.';
      this.costReductionSuggestion = 'Gutters and a little extra slope are cheaper than replacing soaked floors later. Budget is $' + this.cost + '.';
    } else if (kind === 'infill') {
      this.benefits = 'The model put this with the infill sites. Overpass already sees ' + buildings + ' buildings in the tight ring, so a ' + this.buildingType + ' here is a lot-filler, not a campus.';
      this.environmentBenefits = 'Only ' + parks + ' parks and ' + woods + ' woods in the wider ring. Shared walls and a small footprint are the environmental part.';
      this.costReductionSuggestion = 'Do not buy a wide foundation. ' + sqft + ' sq ft stacked or tight to the lot line keeps the ' + this.cost + ' budget from going into extra concrete.';
    } else if (kind === 'green') {
      this.benefits = 'Neighbors in the training set were the green sites. A ' + this.buildingType + ' here should sit next to the open ground instead of in the middle of it. ' + rooms + ' rooms is enough if the park is doing some of the "yard" work.';
      this.environmentBenefits = 'Overpass found ' + parks + ' parks and ' + woods + ' woods within 1.8 km. That is the part worth keeping.';
      this.costReductionSuggestion = 'Skip the big lawn. The money at $' + this.cost + ' goes further on a small footprint and a path to the park that is already there.';
    } else if (kind === 'heat') {
      this.benefits = 'Heat cluster. ' + temp.toFixed(1) + ' C and almost no rain, so the ' + this.buildingType + ' wants a light roof and less west glass. ' + sqft + ' sq ft will cook if it is one big unshaded room.';
      this.environmentBenefits = 'Woods nearby: ' + woods + '. Parks: ' + parks + '. They are doing the cooling the building should not try to replace with more AC.';
      this.costReductionSuggestion = 'A pale roof is the cheap move. At $' + this.cost + ' it beats sizing the cooling for a dark roof.';
    } else {
      this.benefits = 'The weather and the map came back, but the KNN did not. The ' + this.buildingType + ' link is still the one for that type. Start the site model if you want the trained label.';
      this.environmentBenefits = 'Parks ' + parks + ', woods ' + woods + ', buildings ' + buildings + '.';
      this.costReductionSuggestion = 'Cost entered was $' + this.cost + ' for ' + sqft + ' sq ft and ' + rooms + ' rooms.';
    }

    try {
      localStorage.setItem('lastSite', JSON.stringify({
        place: placeName, state: this.state, building: this.buildingType,
        temp: temp, rain: rain, wind: wind,
        parks: parks, buildings: buildings, woods: woods,
        kind: kind, neighbors: neigh, cost: this.cost, sqft: sqft, rooms: rooms
      }));
    } catch (err) {}
  }
}
