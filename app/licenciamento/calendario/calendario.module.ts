import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { CalendarioRouting } from "./calendario.routing";
import { CalendarioComponent } from "./calendario.component";

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    CalendarioRouting,
  ],
  declarations: [ CalendarioComponent ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class CalendarioModule {}
