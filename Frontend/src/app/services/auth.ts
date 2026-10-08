import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type ScreenKey = 'PRODUCTS' | 'EMPLOYEES' | 'ASSET_ASSIGNMENT' | 'ASSIGNMENT_REGISTER' | 'MASTER_DATA';

export interface ScreenAccess {
  canView: boolean;
  canEdit: boolean;
}

export type MyPermissions = Record<string, ScreenAccess>;

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {

    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, null, { params });
  }

  loadPermissions(): Observable<MyPermissions> {
    return this.http.get<MyPermissions>('http://localhost:8080/api/role-access/my').pipe(
      tap((permissions) => localStorage.setItem('permissions', JSON.stringify(permissions)))
    );
  }

  private getPermissions(): MyPermissions {
    try {
      return JSON.parse(localStorage.getItem('permissions') || '{}');
    } catch {
      return {};
    }
  }

  canView(screen: ScreenKey | string): boolean {
    return this.isAdmin() || !!this.getPermissions()[screen]?.canView;
  }

  canEdit(screen: ScreenKey | string): boolean {
    return this.isAdmin() || !!this.getPermissions()[screen]?.canEdit;
  }

  logout(): void {
    localStorage.removeItem('permissions');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
