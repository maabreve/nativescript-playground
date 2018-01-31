import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LicencaComponent } from "./licenca.component";
import { AuthGuard } from "../../auth-guard.service";

const licencaRoutes: Routes = [
    
    { path: "", component: LicencaComponent, canActivate: [AuthGuard] }
      
];

export const LicencaRouting: ModuleWithProviders = RouterModule.forChild(licencaRoutes);