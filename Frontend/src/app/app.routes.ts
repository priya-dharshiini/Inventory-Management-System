import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Layout } from './layout/layout';
import { Home } from './home/home';

import { ProductManagement } from './product-management/product-management';
import { ProductForm } from './product-form/product-form';

import { EmployeeManagement } from './employee-management/employee-management';
import { EmployeeForm } from './employee-form/employee-form';

import { AssetAssignment } from './asset-assignment/asset-assignment';
import { AssignmentRegister } from './assignment-register/assignment-register';
import { MasterManagement } from './master-management/master-management';
import { UserManagement } from './user-management/user-management';

import { RoleAccess } from './role-access/role-access';

import { adminGuard } from './guards/admin.guard';
import { screenGuard } from './guards/screen.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  {
    path: '',
    component: Layout,
    children: [
      { path: 'home', component: Home },
      { path: 'products', component: ProductManagement, canActivate: [screenGuard('PRODUCTS')] },
      { path: 'products/add', component: ProductForm, canActivate: [screenGuard('PRODUCTS')] },
      { path: 'products/edit/:id', component: ProductForm, canActivate: [screenGuard('PRODUCTS')] },
      { path: 'employees', component: EmployeeManagement, canActivate: [screenGuard('EMPLOYEES')] },
      { path: 'employees/add', component: EmployeeForm, canActivate: [screenGuard('EMPLOYEES')] },
      { path: 'employees/edit/:id', component: EmployeeForm, canActivate: [screenGuard('EMPLOYEES')] },
      { path: 'asset-assignment', component: AssetAssignment, canActivate: [screenGuard('ASSET_ASSIGNMENT')] },
      { path: 'assignment-register', component: AssignmentRegister, canActivate: [screenGuard('ASSIGNMENT_REGISTER')] },
      { path: 'masters', component: MasterManagement, canActivate: [screenGuard('MASTER_DATA')] },
      { path: 'users', component: UserManagement, canActivate: [adminGuard] },
      { path: 'role-access', component: RoleAccess, canActivate: [adminGuard] }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
