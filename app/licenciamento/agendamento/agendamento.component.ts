import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { RouterExtensions } from 'nativescript-angular/router';
import { getString } from 'application-settings';
import { isAndroid, isIOS, screen } from "platform";
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
import { TouchGestureEventData } from "ui/gestures";
import { Page } from 'ui/page';
//import { registerElement } from "nativescript-angular/element-registry";
//registerElement("MaskedInput", () => require("nativescript-maskedinput").MaskedInput);
var appSettings = require('application-settings');
var dialogs = require("ui/dialogs");
var observableModule = require("data/observable");
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';

import { IneaService } from "../../shared/inea.service";
import { AgendamentoMes, HorariosDisponiveis } from "./agendamento.model";
import { DialogContent } from '../../dialog/dialog-content';

@Component({
    moduleId: module.id,
    selector: "IneaAgendamento",
    templateUrl: "./agendamento.component.html",
    styleUrls: ["./agendamento.component.css"],
    providers: [IneaService],
})

export class AgendamentoComponent implements OnInit {
    isLoading = false;
    dataAgendamento = '';
    horaAgendamento = '';
    titulo = '';
    mes = '';
    horariosLisView: Array<HorariosDisponiveis> = [];
    tela: string = 'lista';
    cpf: string = '';
    nome: string = '';
    telefone: string = '';
    email: string = '';
    canSchedule: boolean = false;
    @ViewChild("maskedInputTelfone") maskedInputTelfone: ElementRef;
    screenH: number;
    screenW: number;
    colorButtonAgendar: string;
    colorButtonVoltar: string;

    constructor(private ineaService: IneaService,
                private router: Router,
                private page: Page,
                private route: ActivatedRoute,
                private modalService: ModalDialogService,
                private viewContainerRef: ViewContainerRef,
                private routerExtensions: RouterExtensions) {}

    ngOnInit() {
        this.route.params.subscribe(params => {

            let horarios = appSettings.getString('inea-horarios');
            if (horarios) {
                JSON.parse(horarios).forEach(horario => {
                    let hr = new HorariosDisponiveis(horario, false);
                    this.horariosLisView.push(hr);
                });
            }

            this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
            this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
            this.colorButtonAgendar = "#F5F5F5";
            this.colorButtonVoltar = "#F5F5F5";
            this.mes = params['mes'];
            this.dataAgendamento = params['dataAgendamento'];
        });

        if (isAndroid) {
            application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
                data.cancel = true;
                application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
                this.router.navigate(["licenciamento/false/agendar"]);
            });
        }
    }

    setCanSchedule() {
        this.canSchedule = this.maskedInputTelfone.nativeElement.text.length > 9;
    }

    onChangeTelefone(event) {
        this.setCanSchedule();
    }

    onBack() {
        if (this.tela === 'edicao') {
            this.tela = 'lista';
            this.horaAgendamento = '';
        } else {
            this.router.navigate(['/licenciamento/false/calendario', this.mes]);
        }
    }

    onSelect(e) {
        let item = this.horariosLisView[e.index];

        this.horaAgendamento = item.hora;
        this.tela = 'edicao';
    }

    onSchedule() {
        this.isLoading = true;
        this.email = getString('email');
        this.ineaService.gravarAgenda(this.maskedInputTelfone.nativeElement.text, this.email, 'Licenca', this.dataAgendamento + ' ' + this.horaAgendamento)
            .subscribe(resposta => {
              this.isLoading = false;
              this.showModal({type: 'inea-agendamento', msg: this.dataAgendamento + ' ' + this.horaAgendamento}, () => this.router.navigate(['/licenciamento/false/agendar/listar']), () => this.router.navigate(['/licenciamento/false/calendario', this.mes]));
              // dialogs.alert({
              //     title: "Inea Agendamento",
              //     message: "Agenda efetuada com sucesso!",
              //     okButtonText: "Ok"
              // });
              // this.router.navigate(['/licenciamento/calendario', this.mes]);
            },
            err => {
                this.isLoading = false;
                this.showModal({type:'inea-agendamento-erro', msg:err});
                // dialogs.alert({
                //     title: "Inea Agendamento",
                //     message: '' + err,
                //     okButtonText: "Ok"
                // })
              }
            );
    }

    onAgendarTouch(args: TouchGestureEventData) {
        if (args.action === 'down') {
            this.colorButtonAgendar = "#C3C3C3";
        } else if (args.action === 'up' || args.action === ' cancel') {
            this.colorButtonAgendar = "#F5F5F5";
        }
    }

    onBackTouch(args: TouchGestureEventData) {
        if (args.action === 'down') {
            this.colorButtonVoltar = "#C3C3C3";
        } else if (args.action === 'up' || args.action === ' cancel') {
            this.colorButtonVoltar = "#F5F5F5";
        }
    }

    // mensagens modal
    showModal(obj:Object, fn:Function = null, fn2:Function = null) {
        let options: ModalDialogOptions = {
        context: obj,
        fullscreen: false,
        viewContainerRef: this.viewContainerRef
        };
        this.modalService.showModal(DialogContent, options)
        .then((dialogResult: string) => {
            if (dialogResult == 'OK' && typeof(fn) == 'function') {
                fn();
            }
            if (dialogResult == 'Cancel' && typeof(fn2) == 'function') {
                fn2();
            }
            });
    }
}
