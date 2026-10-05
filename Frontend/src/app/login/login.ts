import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Please enter username';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter password';
      return;
    }

    this.loading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('username', response.username);

        // Load what this user is allowed to see before opening the app
        this.authService.loadPermissions().subscribe({
          next: () => this.finishLogin(),
          error: () => this.finishLogin()
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || error.error || 'Invalid username or password';
      }
    });
  }

  private finishLogin(): void {
    this.loading = false;
    this.router.navigate(['/home']);
  }
}
