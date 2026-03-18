// 

import { Component, inject, computed, AfterViewInit, ElementRef, viewChild, signal, effect } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
// import { TransactionService } from '../../services/transaction.service';
import { TransactionService } from '../../services/transaction';
// import { ModalService } from '../../services/modal.service';
import { ModalService } from '../../services/modal';
import { Transaction, CATEGORY_ICONS } from '../../models/transaction.model';
// import { Chart, registerables } from 'chart.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, RouterLink, PercentPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements AfterViewInit {
  private txService:any    = inject(TransactionService);
  private modalService:any = inject(ModalService);

  readonly balance       = this.txService.balance;
  readonly totalIncome   = this.txService.totalIncome;
  readonly totalExpenses = this.txService.totalExpenses;
  readonly savingsRate   = this.txService.savingsRate;
  readonly recentTx      = this.txService.recentTransactions;
  readonly topCategories = computed(() => this.txService.getCategoryTotals('expense').slice(0, 5));
  readonly monthlyTotals = computed(() => this.txService.getMonthlyTotals().slice(-6));

  categoryIcons = CATEGORY_ICONS;

  private chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChart');
  private donutCanvas = viewChild<ElementRef<HTMLCanvasElement>>('donutChart');
  private barChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;
  private initialized = signal(false);

  constructor() {
    effect(() => {
      const monthly = this.monthlyTotals();
      const cats    = this.topCategories();
      if (this.initialized()) {
        this._renderBarChart(monthly);
        this._renderDonutChart(cats);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._renderBarChart(this.monthlyTotals());
      this._renderDonutChart(this.topCategories());
      this.initialized.set(true);
    }, 50);
  }

  openAdd(): void { this.modalService.openAdd(); }
  openEdit(tx: Transaction): void { this.modalService.openEdit(tx); }

  formatMonth(ym: string): string {
    const [y, m] = ym.split('-');
    return new Date(+y, +m - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  }

  getCategoryPercent(total: number): number {
    const grand = this.totalExpenses();
    return grand > 0 ? (total / grand) * 100 : 0;
  }

  private _renderBarChart(data: { month: string; income: number; expense: number }[]): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;
    this.barChartInstance?.destroy();
    this.barChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => this.formatMonth(d.month)),
        datasets: [
          { label: 'Income',   data: data.map(d => d.income),  backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6, borderSkipped: false },
          { label: 'Expenses', data: data.map(d => d.expense), backgroundColor: 'rgba(244,63,94,0.75)',  borderRadius: 6, borderSkipped: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#8b91b8', font: { family: 'Plus Jakarta Sans', size: 12 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: (ctx:any) => ` $${ctx.parsed.y.toLocaleString()}` } }
        },
        scales: {
          x: { ticks: { color: '#8b91b8' }, grid: { color: 'rgba(42,47,74,0.6)' } },
          y: { ticks: { color: '#8b91b8', callback: (v:any) => '$' + Number(v).toLocaleString() }, grid: { color: 'rgba(42,47,74,0.6)' } }
        }
      }
    });
  }

  private _renderDonutChart(cats: { category: string; total: number }[]): void {
    const canvas = this.donutCanvas()?.nativeElement;
    if (!canvas) return;
    const COLORS = ['#f0a030','#f43f5e','#8b5cf6','#3b82f6','#10b981'];
    this.donutChartInstance?.destroy();
    this.donutChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.category),
        datasets: [{ data: cats.map(c => c.total), backgroundColor: COLORS.slice(0, cats.length), borderWidth: 2, borderColor: '#161929', hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8b91b8', font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 16, boxWidth: 12 } },
          tooltip: { callbacks: { label: (ctx:any) => ` $${Number(ctx.parsed).toLocaleString()}` } }
        }
      }
    });
  }
}