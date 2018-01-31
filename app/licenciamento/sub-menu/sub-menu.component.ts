import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Page } from 'ui/page';
import { Color } from 'color';
import { getString, setString } from 'application-settings';
    import { isAndroid, isIOS, screen } from "platform"
import { setTimeout } from "timer";
var appSettings = require('application-settings');
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";

// var dialogs = require("ui/dialogs");
import { ModalDialogService, ModalDialogOptions, ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { IneaController } from "../../shared/inea.controller";
import { IneaService } from "../../shared/inea.service";
import { Menu } from "../menu/menu.model";
import { DialogContent } from '../../dialog/dialog-content';

@Component({
    moduleId: module.id,
    selector: "IneaSubmenu",
    templateUrl: "./sub-menu.component.html",
    styleUrls: ["./sub-menu.component.css"],
})

export class SubMenuComponent implements OnInit {
    menuList: Array<Menu> = [];
    isLoading: boolean = false;
    itemSelecionado: number;
    itemColor: string;
    screenH: number;
    screenW: number;

    constructor(private ineaController: IneaController,
                private ineaSerivce: IneaService,
                private page: Page,
                private router: Router,
                private modalService: ModalDialogService,
                private viewContainerRef: ViewContainerRef,
                private route: ActivatedRoute,
                private changeDetectionRef: ChangeDetectorRef) {}

    ngOnInit() {
        this.page.actionBar.backgroundColor = new Color("#00b4b9");
        this.page.actionBar.title = '';
        this.isLoading = true;
        this.itemColor = "#FFFFFF";

        this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
        this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
        let that = this;
        //setTimeout(function () {
        that.route.params.subscribe(params => {
            let id = +params['id'];
            appSettings.setString('inea-submenu-id', id.toString());
            let menuCache = JSON.parse(appSettings.getString('inea-menus') || '[]');
            that.menuList = that.obterMenuItem(menuCache, id).menus;

            if (that.menuList.length === 0) {
              // TODO resolver esse problema
                that.showModal({type:'submenu-nao-cadastrado'});
                // dialogs.alert({
                //     title: 'Inea',
                //     message: 'Nenhum sub-menu cadastrado.',
                //     okButtonText: 'Ok'
                // });

            } else if (that.menuList.length > 1) {
                that.menuList.sort(function (a, b) {
                    return a.ordem - b.ordem;
                });
            }
            that.isLoading = false;
        });

        if (isAndroid) {
          application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
            data.cancel = true;
          });
        }

        //}, 50);
    }

    onTap(item) {
        this.isLoading = true;
        let colorView = item.cor;
        item.cor = '#C3C3C3';
        if (item.titulo !== undefined) {
            this.page.actionBar.title = item.titulo.toUpperCase();
            this.changeDetectionRef.detectChanges();
        }
     
        if (isAndroid) {
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
        }

        let that = this;
        setTimeout(function () {
            if (item.etapa === 'ATIVIDADE' || item.etapa === 'MUNICIPIO' || item.etapa === 'QUESTIONARIO' || item.etapa === 'LICENCA') {
                that.ineaController.criarProcesso();
            }

            that.ineaController.navigate(item.etapa, item.id, 0, item.titulo, [], 2, '', 
                [], item.resultadosMobile, colorView, -1, [], false, 0, '', '', item.qciId);

            that.isLoading = false;
        }, 100);
    }

    obterMenuItem(subItems, idPai) {
        if (subItems) {
            for (var i = 0; i < subItems.length; i++) {
                if (subItems[i].id === idPai) {
                    return subItems[i];
                };
                var found = this.obterMenuItem(subItems[i].menus, idPai);
                if (found) return found;
            }
        }
    }

  // mensagens modal
  showModal(obj:Object) {
    let options: ModalDialogOptions = {
      context: obj,
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };
    this.modalService.showModal(DialogContent, options);
  }
}
