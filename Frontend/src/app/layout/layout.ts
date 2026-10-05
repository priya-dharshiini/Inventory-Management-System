import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {

  username = '';
  role = '';
  isAdmin = false;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    this.username = this.authService.getUsername();
    this.role = this.authService.getRole();
    this.isAdmin = this.authService.isAdmin();
  }

  // Refresh permissions on every page load so changes made by an
  // Admin in Role Access take effect without logging in again.
  ngOnInit(): void {
    this.authService.loadPermissions().subscribe({ error: () => {} });
  }

  avatarLetter(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '?';
  }

  logout(): void {

    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
