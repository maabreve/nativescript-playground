import { NativeScriptUISideDrawerModule } from "nativescript-telerik-ui/sidedrawer/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { QuestionarioRouting } from "./questionario.routing";
import { QuestionarioComponent } from "./questionario.component";
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
    QuestionarioRouting
  ],
  declarations: [ QuestionarioComponent ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class QuestionarioModule {}
