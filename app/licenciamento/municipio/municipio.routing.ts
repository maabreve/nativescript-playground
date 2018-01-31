import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MunicipioComponent } from "./municipio.component";
import { AuthGuard } from "../../auth-guard.service";

const municipioRoutes: Routes = [
    
    { path: "", component: MunicipioComponent, canActivate: [AuthGuard] }
      
];

export const MunicipioRouting: ModuleWithProviders = RouterModule.forChild(municipioRoutes);