import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { ResultadoRouting } from "./resultado.routing";
import { ResultadoComponent } from "./resultado.component";

@NgModule({
   providers: [
  ],
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    ResultadoRouting,
  ],
  declarations: [ ResultadoComponent ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class ResultadoModule {}
