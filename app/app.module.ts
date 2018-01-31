//Nativescript
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NgModule, NO_ERRORS_SCHEMA, ErrorHandler } from "@angular/core";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { authProviders, appRoutes } from "./app.routing";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';

//Inea
import { LoginModule } from "./login/login.module";
import { LicenciamentoModule } from "./licenciamento/licenciamento.module";
import { AppComponent } from "./app.component";
import { DialogContent } from './dialog/dialog-content';
import { setStatusBarColors, BackendService, LoginService, IneaService, IneaController } from "./shared";
setStatusBarColors();

/**
 * classe de erros
 * @param {any} error erro ocorrido
 */
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    alert(error);
    console.log(error);
  }
}

@NgModule({
  providers: [
    BackendService,
    LoginService,
    IneaService,
    IneaController,
    authProviders,
    ModalDialogService,
    {provide: ErrorHandler, useClass: MyErrorHandler},
  ],
  imports: [
    NativeScriptModule,
    NativeScriptHttpModule,
    NativeScriptRouterModule,
    NativeScriptRouterModule.forRoot(appRoutes),
    LoginModule,
    LicenciamentoModule,
  ],
  declarations: [
      AppComponent,
      DialogContent
  ],
  entryComponents: [ DialogContent ],
  bootstrap: [ AppComponent ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
