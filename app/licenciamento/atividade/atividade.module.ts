import { NativeScriptUISideDrawerModule } from "nativescript-telerik-ui/sidedrawer/angular";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { AtividadeRouting } from "./atividade.routing";
import { AtividadeComponent } from "./atividade.component";
import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";

@NgModule({
   providers: [
    IneaService,
    IneaController
  ],
  imports: [
    NativeScriptModule,
    NativeScriptUISideDrawerModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    AtividadeRouting,
  ],
  declarations: [ AtividadeComponent ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class AtividadeModule {}
