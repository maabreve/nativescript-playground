import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Page } from "ui/page";
import { ModalDialogService, ModalDialogOptions, ModalDialogParams } from "nativescript-angular/modal-dialog";
import { isAndroid, isIOS, screen } from "platform";
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";

import { IneaService, BackendService } from "../../../shared";

export interface Agendamento {
  id: string;
  dia: string;
}

@Component({
    moduleId: module.id,
    selector: "agenda-lista",
    templateUrl: "./agenda-lista.component.html",
    styleUrls: ["./agenda-lista.component.css"],
})

export class AgendaListaComponent implements OnInit {

  public result: string;
  isLoading: boolean = false;
  dias: Agendamento[];

  constructor(private page: Page,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: ModalDialogService,
              private viewContainerRef: ViewContainerRef,
              private ineaService: IneaService) {
  }

  ngOnInit() {
    this.loadAgenda();
    if (isAndroid) {
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            data.cancel = true;
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
            this.router.navigate(["licenciamento/false/agendar"]);
        });
    }
  }

  loadAgenda() {
    this.ineaService.obterAgendamentosUsuario( BackendService.email )
      .subscribe( resp => {
        this.dias = [];
        for (let item of resp) {
          this.dias.push({
            id: item.id,
            dia: item.data.substring(0, item.data.length - 3)
          });
        }
      } );
  }

  deleteAgenda(data:any) {
    let options: ModalDialogOptions = {
      context: { promptMsg: data.dia },
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };

    this.modalService.showModal(DialogContent, options)
      .then((dialogResult: string) => {
        // this.result = dialogResult;
        // console.log("resultado do modal:",this.result);
        if (dialogResult == "OK") {
          this.ineaService.deletarAgendamentosUsuario( data.id )
            .subscribe(res => {
              if (res) this.loadAgenda();
            });
        }
      });
  }

  novoAgend() {
    this.isLoading = true;
    let mes = new Date().getUTCMonth() + 1;
    this.router.navigate(["licenciamento/false/calendario", mes.toString()]);
  }

}


// componente de modal
@Component({
  selector: "modal-content",
  styles: [`
    .modal-dialog {
      margin: 20;
    }
    .modal-title, .modal-title2 {
      color: #50c8ca;
      text-transform: uppercase;
      font-size: 16;
    }
    .modal-title2 {
      padding-bottom: 8;
      border-bottom-color: #50c8ca;
      border-bottom-style: solid;
      border-bottom-width: 1;
      margin-bottom: 8;
    }
    .modal-msg {
      font-size: 14;
      margin-bottom: 14;
    }
    .modal-btn-cancel {
      color: #666666;
      border-color: #666666;
      border-style: solid;
      border-width: 1;
      background-color: #FFF;
      height: 40;
    }
    .modal-btn-ok {
      color: #FFF;
      background-color: #ba3035;
      padding: 18 22 18 22;
    }
    `],
  template: `
    <StackLayout class="modal-dialog">
      <Label class="modal-title" text="Tem certeza que deseja remover"></Label>
      <Label class="modal-title2" text="este agendamento?"></Label>
      <Label class="modal-msg"  textWrap="true" row="0" col="0">
        <FormattedString>
          <Span text="Data do agendamento: "></Span>
          <Span [text]="prompt" fontAttributes="Bold"></Span>
        </FormattedString>
      </Label>
      <GridLayout class="modal-btn-area" columns="auto,*,auto" rows="auto">
        <Button class="modal-btn-cancel" row="0" col="0" text="Fechar" (tap)="close('Cancel')"></Button>
        <Button class="icon modal-btn-ok" row="0" col="2" text="&#xe904; Remover" (tap)="close('OK')"></Button>
      </GridLayout>
    </StackLayout>
  `
})
export class DialogContent {
    public prompt: string;
    constructor(private params: ModalDialogParams) {
        this.prompt = params.context.promptMsg;
    }

    public close(result: string) {
        this.params.closeCallback(result);
  }
}
