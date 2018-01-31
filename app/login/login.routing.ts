import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login.component';
import { EsqueciSenhaComponent } from './esqueci-senha/esqueci-senha.component';
import { CriarContaComponent } from './criar-conta/criar-conta.component';

const loginRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'criar-conta', component: CriarContaComponent }
];
export const loginRouting: ModuleWithProviders = RouterModule.forChild(loginRoutes);
