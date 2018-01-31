import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, ViewContainerRef  } from "@angular/core";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { RouterExtensions } from 'nativescript-angular/router';
import { isAndroid, isIOS, device, screen } from "platform";
import { TouchGestureEventData } from "ui/gestures";
import { Page } from 'ui/page';
import { Button } from 'ui/button';
import { Color } from 'color';
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
var appSettings = require('application-settings');
// var dialogs = require("ui/dialogs");
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';

import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";
import { TipoLicenca } from "./licenca.model";
import { Respostas, SelecaoEntidades, AtividadesSelecionadas } from '../../shared/respostas.model';
import { DialogContent } from '../../dialog/dialog-content';

@Component({
    moduleId: module.id,
    selector: "IneaLicenca",
    templateUrl: "./licenca.component.html",
    styleUrls: ["./licenca.component.css"]
})

export class LicencaComponent implements OnInit {
    private menuId: number;
    private menuName: string;
    private breadcrumbIndex: number;
    private canBackNavigation: boolean;
    private itensEdicao: Array<any>;
    private tiposLicencaListView: Array<TipoLicenca>;
    private isLoading: boolean;
    private selecionou: boolean;
    private numeroLicenca: string;
    private colorView: string;
    private colorButtonContinuar: string;
    private atividadesSelecionadas: Array<AtividadesSelecionadas>;
    private tituloMenu: string 
  
    constructor(private ineaService: IneaService,
        private ineaController: IneaController,
        private router: Router,
        private page: Page,
        private changeDetectionRef: ChangeDetectorRef,
        private viewContainerRef: ViewContainerRef,
        private modalService: ModalDialogService,
        private route: ActivatedRoute,
        private routerExtensions: RouterExtensions) {

    }

    ngOnInit() {
        this.tiposLicencaListView = [];
        this.isLoading = true;
        this.selecionou = false;
        this.numeroLicenca = '';
        this.menuId = 0;

        this.route.params.subscribe(params => {
            this.breadcrumbIndex = +params['breadcrumbIndex'];
            this.itensEdicao = JSON.parse(params['itensEdicao']);
            this.colorView = params["cor"] !== undefined ? params["cor"] : "#00b4b9";
            this.tituloMenu = params['tituloMenu'];
            if (this.tituloMenu !== undefined && this.tituloMenu.trim() !== '') {
                this.page.actionBar.title = this.tituloMenu;
            }
            this.canBackNavigation = this.ineaController.canBackNavigation();
            this.page.actionBar.backgroundColor = new Color(this.colorView);
            this.colorButtonContinuar = "#FFFFFF";
            this.menuId = params["menuId"];
            this.menuName = params["menuName"];
            this.atividadesSelecionadas = JSON.parse(params["atividadesSelecionadas"]);
            this.loadTiposLicenca();
        });

        if (isAndroid) {
          application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            if (this.router.isActive('licenciamento/licenca', false)) {
              data.cancel = true;
              application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
              this.onNavigationBack();
            }
          });
        }
    }

    loadTiposLicenca() {

        this.ineaService.obterTiposLicenca().subscribe(licenca => {
            if (this.itensEdicao.length > 0) {
                this.numeroLicenca = this.itensEdicao[0].resposta;
            }

            appSettings.setString('inea-tipos-licenca', JSON.stringify(licenca));

            licenca.forEach(l => {
                let selected: boolean = false;
                this.itensEdicao.forEach(item => {
                    if (item.id === l.id) {
                        selected = true;
                        this.selecionou = true;
                    }
                });

                this.tiposLicencaListView.push(new TipoLicenca(l.id, l.nome, selected));
            });
            this.isLoading = false;
            this.changeDetectionRef.detectChanges();

        });
    }

    onSelect(item) {
        if (item.selecionado)
            return;

        this.tiposLicencaListView.forEach(resposta => {
            resposta.selecionado = false;
        });

        item.selecionado = true;
        this.selecionou = true;
    }

    onAnswer() {
        this.isLoading = true;

        let processoId = this.ineaController.obterProcesso();
        let tipoLicenca = this.tiposLicencaListView.filter(tp => tp.selecionado)[0];

        let selecaoEntidadesLicenca: Array<SelecaoEntidades> = [];
        selecaoEntidadesLicenca.push(new SelecaoEntidades(tipoLicenca.id, 'TIPO_LICENCA', this.numeroLicenca, null, false));

        let respostaLicenca = new Respostas(processoId, this.menuId, 'LICENCA', false, 0, false, selecaoEntidadesLicenca);
        let that = this;
        setTimeout(function() {
            that.ineaController.sendAnswers(respostaLicenca, that.menuName,
                    this.atividadesSelecionadas, that.colorView, that.breadcrumbIndex, 0, '', [], false, 0).subscribe(s=> {
                that.isLoading = false;
            }, error => {
                that.handleErrors(error);
        });
        }, 100);

        if (isAndroid) {
          application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
        }
    }

    onNavigationBack() {
        this.isLoading = true;
        if (this.ineaController.canBackNavigation()) {
            this.ineaController.navigateBack(this.breadcrumbIndex);
        } else {
            let submenuId: string = appSettings.getString('inea-submenu-id');
            this.router.navigate(['licenciamento/true/submenu/' + submenuId + '/' + this.colorView]);
        }
    }

    onBreadcrumbTap() {
        this.router.navigate(['licenciamento/false/breadcrumb']);
    }

    onContinuarTouch(args: TouchGestureEventData) {
        if (args.action === 'down') {
            this.colorButtonContinuar = "#C3C3C3";
        } else if (args.action === 'up' || args.action === ' cancel') {
            this.colorButtonContinuar = "#F5F5F5";
        }
    }
    
    //MENSAGENS MODAL
    showModal(obj: Object, fn: Function = null) {
        let options: ModalDialogOptions = {
            context: obj,
            fullscreen: false,
            viewContainerRef: this.viewContainerRef
        };
        this.modalService.showModal(DialogContent, options)
            .then((dialogResult: string) => {
                if (dialogResult == 'OK' && typeof (fn) == 'function') {
                    fn();
                }
            });
    }
    
    public handleErrors(error: Response) {
        this.isLoading = false;
        this.showModal({ type: 'erro-inesperado' });
        
    }
}
