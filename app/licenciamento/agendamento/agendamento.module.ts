import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { AgendamentoRouting } from "./agendamento.routing";
import { AgendamentoComponent } from "./agendamento.component";
import { AgendaMenuComponent } from './agenda-menu/agenda-menu.component';
import { AgendaListaComponent, DialogContent } from './agenda-lista/agenda-lista.component';

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    AgendamentoRouting,
  ],
  declarations: [
    AgendamentoComponent,
    AgendaMenuComponent,
    AgendaListaComponent,
    DialogContent
  ],
  entryComponents: [ DialogContent ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class AgendamentoModule {}
