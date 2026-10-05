import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  constructor(private router: Router, public authService: AuthService) {}

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  goToAssetAssignment(): void {
    this.router.navigate(['/asset-assignment']);
  }

  goToAssignmentRegister(): void {
    this.router.navigate(['/assignment-register']);
  }

}
