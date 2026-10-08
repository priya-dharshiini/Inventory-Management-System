import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetAssignmentService {

private apiUrl = `${environment.apiUrl}/api/assignments`;

  constructor(private http: HttpClient) {}

  createAssignment(
    employeeId: number,
    productId: number,
    assignmentType: string,
    fromDate: string,
    toDate: string,
    remarks: string,
    department?: string,
    designation?: string,
    role?: string,
    productStatus?: string,
    employeeStatus?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('employeeId', employeeId)
      .set('productId', productId)
      .set('assignmentType', assignmentType)
      .set('fromDate', fromDate);

    if (toDate) params = params.set('toDate', toDate);
    if (remarks) params = params.set('remarks', remarks);
    if (department) params = params.set('department', department);
    if (designation) params = params.set('designation', designation);
    if (role) params = params.set('role', role);
    if (productStatus) params = params.set('productStatus', productStatus);
    if (employeeStatus) params = params.set('employeeStatus', employeeStatus);

    return this.http.post<any>(`${this.apiUrl}/createAssignments`, null, { params });
  }

  getAllAssignments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllAssignments`);
  }

  getAssignmentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getAllAssignmentsById/${id}`);
  }

  returnAsset(id: number, condition: string, remarks: string): Observable<any> {

    let params = new HttpParams().set('condition', condition);

    if (remarks) {
      params = params.set('remarks', remarks);
    }

    return this.http.post<any>(`${this.apiUrl}/createAsignments/${id}/return`, null, { params });
  }

  searchAssignments(criteria: { [key: string]: any }): Observable<any[]> {

    let params = new HttpParams();

    for (const key of Object.keys(criteria)) {
      const value = criteria[key];

      if (value !== null && value !== undefined && String(value).trim() !== '') {
        params = params.set(key, String(value).trim());
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }
}
