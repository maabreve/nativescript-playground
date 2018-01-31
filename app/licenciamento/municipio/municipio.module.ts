import { NativeScriptUISideDrawerModule } from "nativescript-telerik-ui/sidedrawer/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { MunicipioRouting } from "./municipio.routing";
import { MunicipioComponent } from "./municipio.component";
import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";
import { GeolocationService } from "../../shared/geolocation.service";

@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  providers: [
    IneaService,
    IneaController,
    GeolocationService
  ],
  imports: [
    NativeScriptModule,
    NativeScriptUISideDrawerModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    MunicipioRouting,
  ],
  declarations: [ MunicipioComponent ]
})

export class MunicipioModule {}
