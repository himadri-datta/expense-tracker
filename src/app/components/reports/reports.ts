// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-reports',
//   imports: [],
//   templateUrl: './reports.html',
//   styleUrl: './reports.css',
// })
// export class Reports {

// }



import { Component, inject, computed, signal, AfterViewInit, ElementRef, viewChild, effect } from '@angular/core';
import { CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services/transaction';
import { CATEGORY_ICONS } from '../../models/transaction.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CurrencyPipe, PercentPipe, DecimalPipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent implements AfterViewInit {
  private txService = inject(TransactionService);
  categoryIcons = CATEGORY_ICONS;

  period        = signal<'monthly' | 'weekly'>('monthly');
  selectedMonth = signal(new Date().toISOString().slice(0, 7));

  readonly monthlyTotals = computed(() => this.txService.getMonthlyTotals());
  readonly weeklyTotals  = computed(() => this.txService.getWeeklyTotals());
  readonly expenseCats   = computed(() => this.txService.getCategoryTotals('expense'));

  readonly selectedMonthTx       = computed(() => { const [y,m] = this.selectedMonth().split('-').map(Number); return this.txService.getByMonth(y, m); });
  readonly selectedMonthIncome   = computed(() => this.selectedMonthTx().filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0));
  readonly selectedMonthExpenses = computed(() => this.selectedMonthTx().filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0));
  readonly selectedMonthNet      = computed(() => this.selectedMonthIncome() - this.selectedMonthExpenses());
  readonly selectedMonthCats     = computed(() => {
    const map = new Map<string, number>();
    for (const t of this.selectedMonthTx().filter(x => x.type==='expense')) map.set(t.category, (map.get(t.category)??0) + t.amount);
    return [...map.entries()].sort(([,a],[,b]) => b-a).map(([cat,total]) => ({ cat, total }));
  });
  readonly availableMonths = computed(() => [...new Set(this.txService.transactions().map(t => t.date.slice(0,7)))].sort().reverse());

  private trendCanvas = viewChild<ElementRef<HTMLCanvasElement>>('trendChart');
  private catCanvas   = viewChild<ElementRef<HTMLCanvasElement>>('catChart');
  private trendChart: Chart | null = null;
  private catChart:   Chart | null = null;
  private initialized = signal(false);

  constructor() {
    effect(() => {
      const monthly = this.monthlyTotals(); const weekly = this.weeklyTotals(); const cats = this.expenseCats(); const p = this.period();
      if (this.initialized()) {
        this._renderTrendChart(p === 'monthly' ? monthly : weekly.slice(-8));
        this._renderCatChart(cats.slice(0, 8));
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._renderTrendChart(this.period() === 'monthly' ? this.monthlyTotals() : this.weeklyTotals().slice(-8));
      this._renderCatChart(this.expenseCats().slice(0, 8));
      this.initialized.set(true);
    }, 50);
  }

  formatMonthLabel(ym: string): string { const [y,m] = ym.split('-'); return new Date(+y,+m-1).toLocaleString('default',{month:'short',year:'2-digit'}); }
  formatWeekLabel(d: string): string { return new Date(d).toLocaleDateString('default',{month:'short',day:'numeric'}); }
  getCatPercent(total: number): number { const g = this.selectedMonthExpenses(); return g > 0 ? (total/g)*100 : 0; }

  private _renderTrendChart(data: any[]): void {
    const canvas = this.trendCanvas()?.nativeElement; if (!canvas) return;
    this.trendChart?.destroy();
    this.trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => d.month ? this.formatMonthLabel(d.month) : this.formatWeekLabel(d.week)),
        datasets: [
          { label: 'Income',   data: data.map(d => d.income),  borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#10b981', pointRadius: 4 },
          { label: 'Expenses', data: data.map(d => d.expense), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.1)',  tension: 0.4, fill: true, pointBackgroundColor: '#f43f5e', pointRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: '#8b91b8', font: { family: 'Plus Jakarta Sans', size: 12 }, boxWidth: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ` $${(ctx.parsed?.y ?? 0).toLocaleString()}` } } },
        scales: { x: { ticks: { color: '#8b91b8' }, grid: { color: 'rgba(42,47,74,0.5)' } }, y: { ticks: { color: '#8b91b8', callback: v => '$'+Number(v).toLocaleString() }, grid: { color: 'rgba(42,47,74,0.5)' } } }
      }
    });
  }

  private _renderCatChart(cats: { category: string; total: number }[]): void {
    const canvas = this.catCanvas()?.nativeElement; if (!canvas) return;
    const COLORS = ['#f0a030','#f43f5e','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4'];
    this.catChart?.destroy();
    this.catChart = new Chart(canvas, {
      type: 'bar',
      data: { labels: cats.map(c => c.category), datasets: [{ label: 'Expenses', data: cats.map(c => c.total), backgroundColor: COLORS.slice(0, cats.length), borderRadius: 6, borderSkipped: false }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` $${(ctx.parsed?.x ?? 0).toLocaleString()}` } } },
        scales: { x: { ticks: { color: '#8b91b8', callback: v => '$'+Number(v).toLocaleString() }, grid: { color: 'rgba(42,47,74,0.5)' } }, y: { ticks: { color: '#8b91b8' }, grid: { color: 'transparent' } } }
      }
    });
  }
}