import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";
import { SubMenuRouting } from "./sub-menu.routing";
import { SubMenuComponent } from "./sub-menu.component";
// import { DialogContent } from '../../dialog/dialog-content';

@NgModule({
   providers: [
    IneaService,
    IneaController,
  ],
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    SubMenuRouting,
  ],
  declarations: [
    SubMenuComponent,
    // DialogContent
  ],
  // entryComponents: [ DialogContent ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class SubMenuModule {}
