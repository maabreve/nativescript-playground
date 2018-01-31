import { Component, OnInit, ViewContainerRef, ChangeDetectorRef } from "@angular/core";
import { Router, } from "@angular/router";
import { setTimeout } from "timer";
import { Page } from "ui/page";
import { getString, setString } from "application-settings";
import { Color } from "color";
var appSettings = require("application-settings");
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid, isIOS, screen } from "platform"
import * as application from "application";

import { LoginService } from "../shared/login.service";
import { IneaService } from "../shared/inea.service";
import { IneaController } from "../shared/inea.controller";
import { Versoes } from "../shared/versoes.model";
import { Menu } from "../licenciamento/menu/menu.model";
import { MenuComponent } from "../licenciamento/menu/menu.component";
import { DialogContent } from "../dialog/dialog-content";

@Component({
  moduleId: module.id,
  selector: "IneaHomepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
  providers: [LoginService]
})

export class HomepageComponent implements OnInit {
  isLoadingMenu: boolean;
  screenH: number;
  screenW: number;
  menuList: Array<Menu> = [];
  constructor(private router: Router,
    private page: Page,
    private loginService: LoginService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef,
    private ineaController: IneaController,
    private changeDetectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.page.actionBarHidden = true;
    this.isLoadingMenu = false;
    this.screenH = (screen.mainScreen.heightDIPs - 50) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
    let selectedMenu = getString("selectedMenu") || "";
    this.loadMenu();
    if (isAndroid) {
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
            data.cancel = true;
        });
    }
  }


  loadMenu() {
    this.isLoadingMenu = true;
    let token: string = getString("token");
    let that = this;

    setTimeout(function () {
      let menuCache = JSON.parse(appSettings.getString("inea-menus") || "[]");

      if (menuCache.length === 0) {
        that.showModal({ type: "menu-nao-carregado" });
      }
      else {
        that.menuList = []
        menuCache.forEach(menu => {
          if (menu.label.toUpperCase() === "LICENCIAMENTO" || menu.label.toUpperCase() === "AGENDAMENTO"){
            that.menuList.push(menu);
          }
          that.changeDetectionRef.detectChanges();
        });

        if (that.menuList.length > 1) {
          that.menuList.sort(function (a, b) {
            return (a.ordem < b.ordem) ? -1 : (a.ordem > b.ordem) ? 1 : 0;
          });
        }
      }
    }, 200);

    this.isLoadingMenu = false;
  }


  onLogoff() {
    this.loginService.logoff();
    this.router.navigate(["/login"]);
  }

  onTap(e) {
    this.isLoadingMenu = true;
    let item = this.menuList[e.index];
    let that = this;

    this.page.actionBar.title = "";

    if (isAndroid) {
          application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
      }
    setTimeout(function () {
      setString("selectedMenu", item.label);

      if (item.etapa === "ATIVIDADE" || item.etapa === "MUNICIPIO" || item.etapa === "QUESTIONARIO" || item.etapa === "LICENCA")
        that.ineaController.criarProcesso();

      if (item.etapa === "AGENDA") {
        setString("selectedMenu", "Agendamento");
        that.router.navigate(["licenciamento/false/agendar"]);
      } else {
        
      that.ineaController.navigate(item.etapa, item.id, 0, item.titulo, [], 1, "", [],
        item.resultadosMobile, item.cor, -1, [], false, 0, "");
      }

      that.isLoadingMenu = false;
    }, 50);
  }

  // mensagens modal
  showModal(obj: Object) {
    let options: ModalDialogOptions = {
      context: obj,
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };

    this.modalService.showModal(DialogContent, options);
  }
  
}