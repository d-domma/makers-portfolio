import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Stock {
  company: string;
  symbol: string;
  price: number;
  change: number;
  asOf: string;
  link: string;
}

interface Story {
  title: string;
  summary: string;
  link: string;
}

interface TaxRow {
  category: string;
  figure: string;
  link: string;
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
  newsStatus = '';
  updateStatus = '';
  checked = '';
  stocks: Stock[] = [
    { company: 'Apple', symbol: 'AAPL', price: 0, change: 0, asOf: '', link: 'https://finance.yahoo.com/quote/AAPL' },
    { company: 'Tesla', symbol: 'TSLA', price: 0, change: 0, asOf: '', link: 'https://finance.yahoo.com/quote/TSLA' },
    { company: 'Google', symbol: 'GOOGL', price: 0, change: 0, asOf: '', link: 'https://finance.yahoo.com/quote/GOOGL' },
    { company: 'Amazon', symbol: 'AMZN', price: 0, change: 0, asOf: '', link: 'https://finance.yahoo.com/quote/AMZN' }
  ];

  news: Story[] = [];
  businessUpdates: Story[] = [];

  irs = 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill';
  revProc = 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf';
  corp = 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section11&num=0&edition=prelim';

  taxRates: TaxRow[] = [];
  taxNote = 'Tax year 2026 federal figures from IRS Revenue Procedure 2025-32. These change by tax year, not by the trading day. There is no single U.S. sales-tax rate, so that old row is gone.';

  constructor() {
    const today = new Date();
    this.checked = today.toLocaleString();
    this.taxRates = [
      { category: 'Income tax, single, taxable income over $50,400', figure: '22%', link: this.irs },
      { category: 'Top income tax, single, over $640,600', figure: '37%', link: this.irs },
      { category: 'Corporate income tax', figure: '21%', link: this.corp },
      { category: 'Long-term capital gains, single, over $49,450 and not over $545,500', figure: '15%', link: this.revProc },
      { category: 'Standard deduction, single', figure: '$16,100', link: this.irs }
    ];
    if (typeof window !== 'undefined') {
      const kick = this.loadStocks();
      const paper = this.loadStories();
      void kick;
      void paper;
    }
  }

  private async loadStocks(): Promise<void> {
    this.stockStatus = 'Loading the latest daily prices…';
    try {
      const jobs = this.stocks.map((stock) => this.pullOne(stock));
      const quotes = await Promise.all(jobs);
      this.stocks = quotes;
      this.stockStatus = '';
    } catch (err) {
      const why = err instanceof Error ? err.message : 'quote failed';
      this.stockStatus = 'Live prices could not be loaded (' + why + '). Try refreshing.';
    }
  }

  private async pullOne(row: Stock): Promise<Stock> {
    const sym = row.symbol;
    const url = '/api/chart/' + sym + '?interval=1d&range=5d';
    const res = await fetch(url);
    if (!res.ok) throw new Error(sym + ' ' + res.status);

    const payload = await res.json() as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            regularMarketChangePercent?: number;
            regularMarketTime?: number;
          };
        }>;
      };
    };

    const chart = payload && payload.chart ? payload.chart : {};
    const list = chart.result ? chart.result : [];
    const first = list.length ? list[0] : undefined;
    const meta = first && first.meta ? first.meta : undefined;
    if (!meta || meta.regularMarketPrice == null) throw new Error(sym + ' missing price');

    const px = Number(meta.regularMarketPrice);
    let delta = 0;
    if (typeof meta.regularMarketChangePercent === 'number') {
      delta = meta.regularMarketChangePercent;
    } else if (meta.chartPreviousClose) {
      const prev = Number(meta.chartPreviousClose);
      if (prev) delta = ((px - prev) / prev) * 100;
    }
    const rounded = Math.round(delta * 100) / 100;
    let asOf = '';
    if (meta.regularMarketTime) {
      const ms = Number(meta.regularMarketTime) * 1000;
      asOf = new Date(ms).toLocaleString();
    }
    const link = 'https://finance.yahoo.com/quote/' + sym;
    return { company: row.company, symbol: sym, price: px, change: rounded, asOf: asOf, link: link };
  }

  private async loadStories(): Promise<void> {
    this.newsStatus = 'Loading headlines…';
    this.updateStatus = 'Loading business headlines…';
    try {
      this.news = await this.pullNews('stock market');
      this.newsStatus = this.news.length ? '' : 'Yahoo did not return any market headlines.';
    } catch (err) {
      this.news = [];
      this.newsStatus = 'Headlines could not be loaded. Try refreshing.';
    }
    try {
      this.businessUpdates = await this.pullNews('business');
      this.updateStatus = this.businessUpdates.length ? '' : 'Yahoo did not return any business headlines.';
    } catch (err) {
      this.businessUpdates = [];
      this.updateStatus = 'Business headlines could not be loaded. Try refreshing.';
    }
  }

  private async pullNews(q: string): Promise<Story[]> {
    const url = '/api/news?q=' + encodeURIComponent(q) + '&quotesCount=0&newsCount=6';
    const res = await fetch(url);
    if (!res.ok) throw new Error('news ' + res.status);
    const payload = await res.json() as { news?: any[] };
    const list = payload && payload.news ? payload.news : [];
    const out: Story[] = [];
    list.forEach((item) => {
      const title = item && item.title ? String(item.title).trim() : '';
      const link = item && (item.link || item.url) ? String(item.link || item.url).trim() : '';
      if (!title || !link) return;
      if (link.indexOf('http') !== 0) return;
      const pub = item.publisher ? String(item.publisher) : 'Yahoo Finance';
      let when = '';
      if (item.providerPublishTime) {
        const ms = Number(item.providerPublishTime) * 1000;
        if (isFinite(ms)) when = new Date(ms).toLocaleString();
      }
      const summary = when ? (pub + ' · ' + when) : pub;
      out.push({ title: title, summary: summary, link: link });
    });
    return out;
  }
}
