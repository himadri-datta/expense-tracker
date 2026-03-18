import { Component, signal } from '@angular/core';
import { RouterOutlet} from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import {TransactionModalComponent} from './components/transaction-modal/transaction-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,TransactionModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('expense-tracker');
}
