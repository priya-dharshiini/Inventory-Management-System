import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return throwError(() => new Error('No authentication token'));
  }

  const authRequest = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authRequest).pipe(
    catchError((error) => {

      // Only an expired/invalid login (401) should log the user out.
      // A 403 just means "not allowed" and must not wipe the session.
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
