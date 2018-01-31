//Nativescript
import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Page } from "ui/page";
import { Router } from "@angular/router";
import { screen } from "platform";
// var dialogs = require("ui/dialogs");
var  appSettings = require("application-settings");
var frameModule = require("ui/frame");
var application = require("application");
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";

//Inea
import { IneaService } from "../shared/inea.service";
import { DialogContent } from "../dialog/dialog-content";

@Component({
  moduleId: module.id,
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"],
})

export class LoadingComponent implements OnInit {
  /****** Properties ******/
  public activity: any;
  public screenH: number;
  public screenW: number;
  public isLoading: boolean;

  /****** Constructor ******/
  constructor(private ineaService: IneaService,
              private modalService: ModalDialogService,
              private viewContainerRef: ViewContainerRef,
              private page: Page,
              private router: Router) {
              }

  /****** NS Events ******/
  ngOnInit() {

    this.page.actionBarHidden = true;
    this.isLoading = true;
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
    this.activity = application.android.startActivity ||
      application.android.foregroundActivity ||
      frameModule.topmost().android.currentActivity ||
      frameModule.topmost().android.activity;

    this.loadCache();
  }

  /****** Cache ******/
  public loadCache() {
    /*
    appSettings.setString("inea-versoes", "");
    appSettings.setString("inea-menus", "");
    appSettings.setString("inea-atividades", "");
    appSettings.setString("inea-municipios", "");
    */

    // appSettings.setString("inea-breadcrumb", "");

    // busca versoes no cache
    let versoesCache = JSON.parse(appSettings.getString("inea-versoes") || "[]");

    // busca ultimas versoes
    console.log("--------------------------------------");
    console.log("CHAMOU API OBTER VERSOES ", new Date());
    this.ineaService.obterVersoes()
      .subscribe(loadedVersoes => {

        console.log("--------------------------------------");
        console.log("RECEBEU VERSOES ", new Date());

        appSettings.setString("inea-versoes", JSON.stringify(loadedVersoes));

        // console.log("--------------------------------------");
        // console.log("GRAVOU CACHE VERSOES ", new Date());
       //  console.log("URL ", loadedVersoes);

        if (versoesCache.length === 0) {
          this.newCache();
        } else {
          let versoesDb = JSON.parse(JSON.stringify(loadedVersoes));
          let menusCache = JSON.parse(appSettings.getString("inea-menus") || "[]");
          let atividadesCache = JSON.parse(appSettings.getString("inea-atividades") || "[]");
          let municipiosCache = JSON.parse(appSettings.getString("inea-municipios") || "[]");
          let tiposLicencaCache = JSON.parse(appSettings.getString("inea-tipos-licenca") || "[]");

          if (+versoesDb.menu !== +versoesCache.menu
            || +versoesDb.atividade !== +versoesCache.atividade
            || municipiosCache.length === 0) {
            this.newCache();
          }
          else {
            this.isLoading = false;
            this.router.navigate(["licenciamento/true/homepage"]);
          }
        }
      },
      err => this.showModal({type: "erro-inicializacao", msg: err + " Obter Versoes" + " - "  })
    );
  }

  public newCache() {
    // console.log("--------------------------------------");
    // console.log("CHAMOU API OBTER MENU ", new Date());

    this.ineaService.obterMenu()
      .subscribe(menuItem => {
        // console.log("--------------------------------------");
        // console.log("RECEBEU MENU ", JSON.stringify(menuItem));

        appSettings.setString("inea-menus", JSON.stringify(menuItem));

        // console.log("--------------------------------------");
        // console.log("CACHE MENU SALVO", new Date());

        // console.log("--------------------------------------");
        // console.log("CHAMOU API OBTER ATIVIDADES", new Date());

        this.ineaService.obterAtividades()
          .subscribe(atividadeItem => {

            // console.log("--------------------------------------");
            // console.log("RECEBEU ATIVIDADES", new Date());

            appSettings.setString("inea-atividades", JSON.stringify(atividadeItem));

            // console.log("--------------------------------------");
            // console.log("CACHE ATIVIDADES SALVO", new Date());

            // console.log("--------------------------------------");
            // console.log("CHAMOU API OBTER MUNICIPIOS", new Date());

            this.ineaService.obterMunicipios()
              .subscribe(municipioItem => {

                  // console.log("--------------------------------------");
                  // console.log("RECEBEU MUNICIPIOS", new Date());

                appSettings.setString("inea-municipios", JSON.stringify(municipioItem));

                // console.log("--------------------------------------");
                // console.log("CACHE MUNICIPIOS SALVO", new Date());

                this.ineaService.obterTiposLicenca()
                  .subscribe(tiposLicencaItem => {
                    appSettings.setString("inea-tipos-licenca", JSON.stringify(tiposLicencaItem));
                    this.isLoading = false;
                    this.router.navigate(["licenciamento/true/homepage"]);
                  },
                  err => this.handleErrors(err, "tipos licenca")
                  );
              },
              err => this.handleErrors(err, "municipio")
              );
          },
          err => this.handleErrors(err, "atividade")
          );
      },  
      err => this.handleErrors(err, "menu")
      );
  }

  /****** Error handling ******/
  handleErrors(error: Response, source: string) {
    console.log("Err inicialização: ", error);
    this.isLoading = false;
    err => this.showModal({type:"erro-inicializacao", msg:error + " - " + source})
    // dialogs.alert({
    //   title: "Inea - Inicialização do App",
    //   message: "" + error,
    //   okButtonText: "Ok"
    // });
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