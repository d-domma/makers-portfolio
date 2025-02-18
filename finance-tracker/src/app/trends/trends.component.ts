import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Stock {
  company: string;
  symbol: string;
  price: number;
  change: number;
}

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.scss'
})
export class TrendsComponent {
  stockStatus = '';
  stocks: Stock[] = [
    { company: 'Apple', symbol: 'AAPL', price: 0, change: 0 },
    { company: 'Tesla', symbol: 'TSLA', price: 0, change: 0 },
    { company: 'Google', symbol: 'GOOGL', price: 0, change: 0 },
    { company: 'Amazon', symbol: 'AMZN', price: 0, change: 0 }
  ];

  news = [
    {
      title: 'Biggest Tech Mergers of the Decade',
      summary: 'Learn how recent mergers are reshaping the tech industry.',
      link: 'https://example.com/mergers'
    },
    {
      title: 'Global Market Trends in 2025',
      summary: 'Experts weigh in on where the economy is heading.',
      link: 'https://example.com/markets'
    },
    {
      title: 'Renewable Energy Stocks Soar',
      summary: 'Renewable energy companies are gaining momentum in the market.',
      link: 'https://example.com/renewable-energy'
    }
  ];

  businessUpdates = [
    { title: 'SpaceX Launch Success', detail: 'SpaceX completed its 20th mission of the year, setting a record.' },
    { title: 'Meta Announces New VR Headset', detail: 'Meta unveils its latest innovation in virtual reality.' },
    { title: 'Coca-Cola Expands Product Line', detail: 'Coca-Cola adds new flavors to its beverage lineup.' }
  ];

  taxRates = [
    { category: 'Income Tax', rate: 22 },
    { category: 'Corporate Tax', rate: 21 },
    { category: 'Sales Tax', rate: 8.5 },
    { category: 'Capital Gains Tax', rate: 15 }
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      const kick = this.loadStocks();
      void kick;
    }
  }

  private async loadStocks(): Promise<void> {
    this.stockStatus = 'Loading live prices…';
    try {
      const jobs = this.stocks.map((stock) => this.pullOne(stock));
      const quotes = await Promise.all(jobs);
      this.stocks = quotes;
      this.stockStatus = '';
    } catch {
      this.stockStatus = 'Live prices could not be loaded. Try refreshing.';
    }
  }

  private async pullOne(row: Stock): Promise<Stock> {
    const sym = row.symbol;
    const url = '/api/chart/' + sym + '?interval=1d&range=5d';
    const res = await fetch(url);
    if (!res.ok) throw new Error('quote failed');

    const payload = await res.json() as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            regularMarketChangePercent?: number;
          };
        }>;
      };
    };

    const chart = payload && payload.chart ? payload.chart : {};
    const list = chart.result ? chart.result : [];
    const first = list.length ? list[0] : undefined;
    const meta = first && first.meta ? first.meta : undefined;
    if (!meta || meta.regularMarketPrice == null) throw new Error('missing price');

    const px = Number(meta.regularMarketPrice);
    let delta = 0;
    if (typeof meta.regularMarketChangePercent === 'number') {
      delta = meta.regularMarketChangePercent;
    } else if (meta.chartPreviousClose) {
      const prev = Number(meta.chartPreviousClose);
      delta = ((px - prev) / prev) * 100;
    }
    const rounded = Math.round(delta * 100) / 100;
    return { company: row.company, symbol: sym, price: px, change: rounded };
  }
}
