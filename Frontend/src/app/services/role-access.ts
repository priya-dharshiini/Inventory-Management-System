import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RolePermission {
  id?: number;
  role: string;
  screen: string;
  canView: boolean;
  canEdit: boolean;
}

export interface RoleAccessMatrix {
  roles: string[];
  screens: string[];
  permissions: RolePermission[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleAccessService {

  private apiUrl = `${environment.apiUrl}/api/role-access`;

  constructor(private http: HttpClient) {}

  getMatrix(): Observable<RoleAccessMatrix> {
    return this.http.get<RoleAccessMatrix>(this.apiUrl);
  }

  save(permissions: RolePermission[]): Observable<RolePermission[]> {
    return this.http.put<RolePermission[]>(this.apiUrl, permissions);
  }
}
