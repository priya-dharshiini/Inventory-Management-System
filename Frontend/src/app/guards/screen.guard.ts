import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const screenGuard = (screen: string): CanActivateFn => () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.canView(screen)) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
