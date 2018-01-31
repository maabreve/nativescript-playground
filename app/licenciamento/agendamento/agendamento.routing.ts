import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgendamentoComponent } from './agendamento.component';
import { AgendaMenuComponent } from './agenda-menu/agenda-menu.component';
import { AgendaListaComponent } from './agenda-lista/agenda-lista.component';
import { AuthGuard } from '../../auth-guard.service';

const agendamentoRoutes: Routes = [

    { path: '', component: AgendaMenuComponent, canActivate: [AuthGuard] },
    { path: 'listar', component: AgendaListaComponent, canActivate: [AuthGuard] },
    { path: "editar/:dataAgendamento/:mes", component: AgendamentoComponent, canActivate: [AuthGuard] }
];

export const AgendamentoRouting: ModuleWithProviders = RouterModule.forChild(agendamentoRoutes);
