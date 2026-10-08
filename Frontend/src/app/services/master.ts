import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MasterType = 'DEPARTMENT' | 'DESIGNATION' | 'ROLE' | 'PRODUCT_STATUS' | 'EMPLOYEE_STATUS';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

 private apiUrl = `${environment.apiUrl}/api/masters`;

  constructor(private http: HttpClient) {}

  getByType(type: MasterType | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${type}`);
  }

  create(type: MasterType | string, value: string, description?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${type}`, {
      value,
      description: description || ''
    });
  }

  update(type: MasterType | string, id: number, value: string, description?: string, active?: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${type}/${id}`, {
      value,
      description: description || '',
      active: active === undefined ? true : active
    });
  }

  delete(type: MasterType | string, id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${type}/${id}`);
  }
}
