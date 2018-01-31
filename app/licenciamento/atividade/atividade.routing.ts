import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AtividadeComponent } from "./atividade.component";
import { AuthGuard } from "../../auth-guard.service";

const atividadeRoutes: Routes = [{ path: "", component: AtividadeComponent }];

export const AtividadeRouting: ModuleWithProviders = RouterModule.forChild(atividadeRoutes);