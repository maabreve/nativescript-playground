import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CalendarioComponent } from "./calendario.component";
import { AuthGuard } from "../../auth-guard.service";

const calendarioRoutes: Routes = [
    
    { path: "", component: CalendarioComponent, canActivate: [AuthGuard] }
      
];

export const CalendarioRouting: ModuleWithProviders = RouterModule.forChild(calendarioRoutes);