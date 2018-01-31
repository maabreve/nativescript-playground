import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Page } from "ui/page";
import { getString, setString } from "application-settings";
import { setTimeout } from "timer";
import { Color } from "color";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid, isIOS, screen } from "platform"
import * as application from "application";
let appSettings = require("application-settings");

// DRAWER
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-telerik-ui/sidedrawer";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-telerik-ui/sidedrawer/angular";

// INEA
import { LoginService, IneaService, IneaController } from "../../shared/";
import { DialogContent } from "../../dialog/dialog-content";
import { Menu } from "./menu.model";
import { Versoes } from "../../shared/versoes.model";

@Component({
  moduleId: module.id,
  selector: "IneaMenu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})

export class MenuComponent implements OnInit {
  isLoadingMenu: boolean;
  menuList: Array<Menu> = [];
  screenH: number;
  screenW: number;
  icon: string;

  @Input() class: string;
  @Input() drawerComponent: SideDrawerType;
  @Output() menuTap = new EventEmitter();

  constructor(private page: Page,
              private router: Router,
              private loginService: LoginService,
              private ineaService: IneaService,
              private modalService: ModalDialogService,
              private viewContainerRef: ViewContainerRef,
              private ineaController: IneaController,
                private changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit() {
    let selectedMenu = getString("selectedMenu") || "";
    this.page.actionBar.backgroundColor = new Color("#00b4b9");
    this.page.actionBar.className = "action-bar";
    this.icon = "res://ic_menu";
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;

    this.loadMenu();
  }

  loadMenu() {
    this.isLoadingMenu = true;
    let token: string = getString("token");
    let that = this;

    setTimeout(function () {
      let menuCache = JSON.parse(appSettings.getString("inea-menus") || "[]");

      if (menuCache.length === 0) {
        this.showModal({type: "menu-nao-carregado"});
      }
      else {
        that.menuList = []
        menuCache.forEach(menu => {
          // TODO: Hack p apresentacao - remover apos implementacao no backend
          if (menu.label.toUpperCase() === "LICENCIAMENTO" || menu.label.toUpperCase() === "AGENDAMENTO") {
            that.menuList.push(menu);
          }
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

  public toggle() {
    this.drawerComponent.toggleDrawerState();
  }

  onTap(e) {
    this.isLoadingMenu = true;
    this.menuTap.emit(e);
    let item = this.menuList[e.index];
    let that = this;

    this.page.actionBar.title = "";

    /*
     if (item.titulo !== undefined && this.page && this.page.actionBar ) {
        this.page.actionBar.title = item.titulo.toUpperCase();
        this.changeDetectionRef.detectChanges();
      }
    */
    
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
          item.resultadosMobile, item.cor, -1, [], false, 0, '', '', item.qciId);
      }

      that.isLoadingMenu = false;
    }, 50);
  }

  onLogoff() {
    this.loginService.logoff();
    this.router.navigate(["/login"]);
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