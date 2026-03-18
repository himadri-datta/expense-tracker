// import { Component, inject } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';
// // import { ModalService } from '../../services/modal.service';
// import { ModalService } from '../../services/modal';

// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [RouterLink, RouterLinkActive],
//   // templateUrl: './navbar.component.html',
//   templateUrl: './navbar.html',
//   styleUrl: './navbar.css'
// })
// export class NavbarComponent {
//   private modalService = inject(ModalService);

//   openAddModal(): void { this.modalService.openAdd(); }

//   navItems = [
//     { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
//     { path: '/transactions', label: 'Transactions', icon: '↕' },
//     { path: '/reports', label: 'Reports', icon: '▦' },
//   ];
// }











import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private modalService = inject(ModalService);

  openAddModal(): void { this.modalService.openAdd(); }

  navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      svg: `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    },
    {
      path: '/transactions',
      label: 'Transactions',
      svg: `<path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    },
    {
      path: '/reports',
      label: 'Reports',
      svg: `<path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    },
  ];
}