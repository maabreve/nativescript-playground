import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ResultadoComponent } from "./resultado.component";
import { AuthGuard } from "../../auth-guard.service";

const resultadoRoutes: Routes = [
    
    { path: "", component: ResultadoComponent, canActivate: [AuthGuard] }
      
];

export const ResultadoRouting: ModuleWithProviders = RouterModule.forChild(resultadoRoutes);