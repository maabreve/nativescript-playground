import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SubMenuComponent } from "./sub-menu.component";
import { AuthGuard } from "../../auth-guard.service";

const submenuRoutes: Routes = [
    
    { path: "", component: SubMenuComponent, canActivate: [AuthGuard] }
      
];

export const SubMenuRouting: ModuleWithProviders = RouterModule.forChild(submenuRoutes);