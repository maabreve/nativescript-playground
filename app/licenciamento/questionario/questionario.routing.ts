import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { QuestionarioComponent } from "./questionario.component";
import { AuthGuard } from "../../auth-guard.service";

const questionarioRoutes: Routes = [
    
    { path: "", component: QuestionarioComponent, canActivate: [AuthGuard] }
      
];

export const QuestionarioRouting: ModuleWithProviders = RouterModule.forChild(questionarioRoutes);