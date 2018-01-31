import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptUISideDrawerModule } from "nativescript-telerik-ui/sidedrawer/angular";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NgModule, NO_ERRORS_SCHEMA, NgModuleFactoryLoader } from "@angular/core";
import { NSModuleFactoryLoader } from "nativescript-angular/router";

import  IneaErrorHandler  from '../shared/inea.error.handler';
import { LoadingComponent } from "./loading.component";
import { HomepageComponent } from "./homepage.component";
import { LicenciamentoComponent } from "./licenciamento.component";
import { MenuComponent } from "./menu/menu.component";
import { MindmapResultadoComponent } from "./mind-map/mindmap-resultado.component";
import { LicenciamentoRouting } from "./licenciamento.routing";
import { LoginService } from '../shared/login.service';
import { IneaService } from "../shared/inea.service";


@NgModule({
   providers: [
    LoginService,
    IneaService, 
    { provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader },
  ],
  imports: [
    NativeScriptModule,
    NativeScriptUISideDrawerModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    LicenciamentoRouting,
  ],
  declarations: [
    LoadingComponent,
    HomepageComponent,
    LicenciamentoComponent,
    MenuComponent,
    MindmapResultadoComponent    
  ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class LicenciamentoModule {}