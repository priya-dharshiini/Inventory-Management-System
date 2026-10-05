import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:8080/api/role-access';

  constructor(private http: HttpClient) {}

  getMatrix(): Observable<RoleAccessMatrix> {
    return this.http.get<RoleAccessMatrix>(this.apiUrl);
  }

  save(permissions: RolePermission[]): Observable<RolePermission[]> {
    return this.http.put<RolePermission[]>(this.apiUrl, permissions);
  }
}
