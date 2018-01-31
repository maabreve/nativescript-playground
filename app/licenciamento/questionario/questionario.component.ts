import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ViewContainerRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { Color } from "color";
import { TouchGestureEventData } from "ui/gestures";
import { isAndroid, isIOS, screen } from "platform";
import { WebView, LoadEventData } from "ui/web-view";
import { openUrl } from "utils/utils";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
var appSettings = require("application-settings");
// var dialogs = require("ui/dialogs");

// DRAWER
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-telerik-ui/sidedrawer";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-telerik-ui/sidedrawer/angular";

import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";
import { QuestoesItem, Questoes, Questionario } from "../../shared/respostas.model";
import { Respostas, SelecaoEntidades, AtividadesSelecionadas } from "../../shared/respostas.model";
import { DialogContent } from "../../dialog/dialog-content";
import { Breadcrumb } from "../../shared/breadcrumb.model";

@Component({
  moduleId: module.id,
  selector: "IneaQuestionario",
  templateUrl: "./questionario.component.html",
  styleUrls: ["./questionario.component.css"],
})

export class QuestionarioComponent implements OnInit {
  menuId: number;
  menuName: string;
  etapa: string;
  atividadesSelecionadas: Array<AtividadesSelecionadas>;
  atividadesSelecionadasTextButton: string;
  mostraAtividadesSelecionadas: boolean;
  breadcrumbIndex: number;
  itensEdicao: Array<any>;
  canBackNavigation: boolean;
  questionarioId: number;
  nomeQuestionario: string;
  questoes: Array<Questoes>;
  mindMap: boolean;
  questaoAtual: string;
  tituloMenu: string;
  respotasListView: Array<QuestoesItem>;
  tipoResposta: string;
  currentItem: number;
  allowNext: boolean;
  respostaTextoLivre: string;
  textoBotaoProximo;
  isLoading: boolean;
  screenH: number;
  screenW: number;
  colorView: string;
  colorButtonContinuar: Color;
  colorButtonBreadcrumb: Color;
  colorButtonVoltar: Color;
  colorButtonSaibaMais: Color;
  colorButtonAtividadesSelecionadas: Color;

  @ViewChild("lstItem") lstItem: ElementRef;

  // SAIBA MAIS
  tituloSaibaMais: string;
  descricaoSaibaMais: string;
  urlSaibaMais: string;
  mostrarSaibaMais: boolean;

  // DRAWER
  _sideDrawerTransition: DrawerTransitionBase;
  _drawer: SideDrawerType;
  drawerContentSize: number;
  @ViewChild(RadSideDrawerComponent) drawerComponent: RadSideDrawerComponent;
  buttonCloseDrawerHeigth: number;
  buttonCloseDrawerWidth: number;
  showBottom: boolean;
  currentBottomDrawer: number;

  // BREADCRUMB
  etapaAtual: string;
  respostaAtual: string;
  breadcrumbList: Array<Breadcrumb> = [];

  constructor(private ineaService: IneaService,
    private ineaController: IneaController,
    private changeDetectionRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private modalService: ModalDialogService,
    private router: Router,
    private page: Page,
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions) {
  }

  ngOnInit() {
    // console.log("--------------------------------------");
    // console.log("INCIALIZOU VIEW QUESTIONARIO    ", new Date());


    this.route.params.subscribe(params => {
      this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
      this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
      this.menuId = 0;
      this.menuName = "";
      this.etapa = "";
      this.atividadesSelecionadas = [];
      this.atividadesSelecionadasTextButton = "";
      this.mostraAtividadesSelecionadas = false;
      this.breadcrumbIndex = 0;
      this.itensEdicao = [];
      this.canBackNavigation = false;
      this.questionarioId = 0;
      this.nomeQuestionario = "";
      this.questoes = [];
      this.mindMap = false;
      this.questaoAtual = "";
      this.respotasListView = [];
      this.tipoResposta = "";
      this.currentItem = 0;
      this.allowNext = false;
      this.respostaTextoLivre = "";
      this.textoBotaoProximo = "";
      this.colorView = "";
      this.colorButtonContinuar = new Color("#FFFFFF");
      this.colorButtonBreadcrumb = new Color("#00b4b9");
      this.colorButtonVoltar = new Color("#FFFFFF");
      this.colorButtonSaibaMais = new Color("transparent");
      this.colorButtonAtividadesSelecionadas = new Color("transparent");
      this.tituloSaibaMais = "";
      this.descricaoSaibaMais = "";
      this.urlSaibaMais = "";
      this.mostrarSaibaMais = false;
      this.drawerContentSize = 150;
      this.buttonCloseDrawerHeigth = 0;
      this.buttonCloseDrawerWidth = 0;
      this.showBottom = false;
      this.isLoading = true;
      this.onInitialize(params);
    });

  }

  private onInitialize(params) {
    this.colorView = params["cor"] !== undefined ? params["cor"] : "#00b4b9";
    this.page.actionBar.backgroundColor = new Color(this.colorView);
    this.tituloMenu = params["tituloMenu"];
    
    if (this.tituloMenu !== undefined && this.tituloMenu.trim() !== "") {
      this.page.actionBar.title = this.tituloMenu;
    }
    this.etapa = params["etapa"];
    this.atividadesSelecionadas = JSON.parse(params["atividadesSelecionadas"]);
    this.atividadesSelecionadasTextButton = this.atividadesSelecionadas.length > 1
      ? this.atividadesSelecionadas.length.toString() + " ATIVIDADES RELACIONADAS"
      : this.atividadesSelecionadas.length.toString() + " ATIVIDADE RELACIONADA";

    this.mostraAtividadesSelecionadas = this.atividadesSelecionadas.length > 0;
    this.menuId = +params["menuId"];
    this.menuName = params["menuName"];
    this.breadcrumbIndex = +params["breadcrumbIndex"];
    this.itensEdicao = params["itensEdicao"];
    this.questionarioId = +params["questionarioId"];
    this.nomeQuestionario = params["nomeQuestionario"];
    this.questoes = JSON.parse(params["questoes"]);
    this.mindMap = params["mindMap"];
    this.canBackNavigation = this.ineaController.canBackNavigation();
    this.currentItem = 0;
    this.respotasListView = [];
    this.allowNext = false;

//  0  console.log("--------------------ENTROU QUESTIONARIO------------------");
//    console.log(JSON.stringify(this.itensEdicao));


    if (this.questoes) {

      // console.log("--------------------ENTROU QUESTIONARIO------------------");
      // console.log(JSON.stringify(this.respostaTextoLivre));

      this.questaoAtual = this.questoes[this.currentItem].nome;
      this.tipoResposta = this.questoes[this.currentItem].tipoResposta;
      this.allowNext = this.tipoResposta === "CHECKBOX" ? true : false;
      this.mostrarSaibaMais = this.questoes[this.currentItem].tituloSaibaMais === undefined ? false : true;
      this.tituloSaibaMais = this.questoes[this.currentItem].tituloSaibaMais;
      this.descricaoSaibaMais = this.questoes[this.currentItem].descricaoSaibaMais;
      this.urlSaibaMais = this.questoes[this.currentItem].urlSaibaMais;

      this.questoes[this.currentItem].itemQuestaos.forEach(item => {
        // item.selecionado = false;
        this.respotasListView.push(new QuestoesItem(item.nome, item.ponto, item.id, item.selecionado));
        if (item.selecionado) {
          this.allowNext = true;
        }
      });
   }

    this.textoBotaoProximo = this.questoes.length > 1 ? "PRÓXIMA" : "PRÓXIMA";
    this.loadBreadcrumb();
    this.isLoading = false;
    if (isAndroid) {
      application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
        data.cancel = true;
        application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);

        // console.log('QUESTIONARIO BACK ANDROID');

        this.onNavigationBack();
      });
    }


    // console.log("--------------------------------------");
    // console.log("RENDERIZOU VIEW QUESTIONARIO    ", new Date());


    this.changeDetectionRef.detectChanges();
  }

  private onAnswer() {
    if (this.currentItem === this.questoes.length - 1) {
      this.sendAnswers();
      return;
    }

    this.currentItem++;
    this.questaoAtual = this.questoes[this.currentItem].nome;
    this.tipoResposta = this.questoes[this.currentItem].tipoResposta;
    this.mostrarSaibaMais = this.questoes[this.currentItem].tituloSaibaMais === undefined ? false : true;
    this.tituloSaibaMais = this.questoes[this.currentItem].tituloSaibaMais;
    this.descricaoSaibaMais = this.questoes[this.currentItem].descricaoSaibaMais;
    this.urlSaibaMais = this.questoes[this.currentItem].urlSaibaMais;

    this.respotasListView = [];
    let possuiSelecionado = false;
    this.questoes[this.currentItem].itemQuestaos.forEach(item => {
      this.respotasListView.push(new QuestoesItem(item.nome, item.ponto, item.id, item.selecionado));
      if (item.selecionado) {
        possuiSelecionado = true;
      }
    });

    this.respostaTextoLivre = this.questoes[this.currentItem].respostaTextoLivre;
    this.allowNext = this.tipoResposta === "CHECKBOX" ? true : possuiSelecionado;
  }

  private sendAnswers() {
    this.isLoading = true;

    let processoId = this.ineaController.obterProcesso();
    let selecaoEntidades: Array<SelecaoEntidades> = [];

    if (isAndroid) {
      application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
    }

    this.questoes.forEach(questao => {
      switch (questao.tipoResposta) {
        case "CHECKBOX":
          questao.itemQuestaos.forEach(resposta => {
            selecaoEntidades.push(new SelecaoEntidades(questao.id, "CHECKBOX", null, resposta.id, resposta.selecionado));
          });
          break;
        case "RADIO":
          selecaoEntidades.push(new SelecaoEntidades(questao.id, "RADIO", null,
            questao.itemQuestaos.filter(s => s.selecionado)[0].id, true));
          break;
        case "TEXTO":
          selecaoEntidades.push(new SelecaoEntidades(questao.id, "TEXTO", this.respostaTextoLivre, null, null));
          break;
      }
    });

    let respostaQuestionario = new Respostas(processoId, this.menuId, this.etapa, false, 0, false, selecaoEntidades);
    let that = this;
    setTimeout(function () {
      // this.respostaTextoLivre = "";
      // console.log("--------------------------------------");
      // console.log("RENDERIZOU VIEW QUESTIONARIO    ", this.respostaTextoLivre);

      that.ineaController.sendAnswers(respostaQuestionario, that.menuName, that.atividadesSelecionadas, that.colorView,
        that.breadcrumbIndex, that.questionarioId, that.nomeQuestionario, that.questoes, false, 0).subscribe(s => {
          that.isLoading = false;
        }, error => {
          that.handleErrors(error);
        });

    }, 100);
  }

  private onNavigationBack() {
    this.isLoading = true;
    if (this.currentItem > 0) {

      this.currentItem--;

      this.questaoAtual = this.questoes[this.currentItem].nome;
      this.tipoResposta = this.questoes[this.currentItem].tipoResposta;
      this.mostrarSaibaMais = this.questoes[this.currentItem].tituloSaibaMais === undefined ? false : true;
      this.tituloSaibaMais = this.questoes[this.currentItem].tituloSaibaMais;
      this.descricaoSaibaMais = this.questoes[this.currentItem].descricaoSaibaMais;
      this.urlSaibaMais = this.questoes[this.currentItem].urlSaibaMais;

      this.respotasListView = [];
      this.questoes[this.currentItem].itemQuestaos.forEach(item => {
        this.respotasListView.push(new QuestoesItem(item.nome, item.ponto, item.id, item.selecionado));
      });

      this.textoBotaoProximo = "PRÓXIMA";
      this.respostaTextoLivre = this.questoes[this.currentItem].respostaTextoLivre;
      this.allowNext = true;

      if (isAndroid) {
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
          data.cancel = true;
          application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
          // console.log('QUESTIONARIO BACK ANDROID');
          this.onNavigationBack();
        });
      }

      this.isLoading = false;
      this.changeDetectionRef.detectChanges();
    }
    else {

      if (this.ineaController.canBackNavigation()) {
        this.ineaController.navigateBack(this.breadcrumbIndex);
      } else {
        let submenuId: string = appSettings.getString("inea-submenu-id");
        this.router.navigate(["licenciamento/true/submenu/" + submenuId + "/" + this.colorView]);
      }
    }
  }

  private onCheck(item) {
    item.selecionado = item.selecionado ? false : true;
    this.questoes[this.currentItem].itemQuestaos.filter(s => s.id === item.id)[0].selecionado = item.selecionado;
    this.allowNext = this.tipoResposta === "CHECKBOX" ? true :
      this.respotasListView.filter(s => s.selecionado).length > 0;
  }

  private onSelect(item) {
    if (item.selecionado)
      return;

    this.allowNext = true;
    this.respotasListView.forEach(resposta => {
      resposta.selecionado = false;
      this.questoes[this.currentItem].itemQuestaos.filter(s => s.id === resposta.id)[0].selecionado = item.selecionado;
    });

    item.selecionado = true;
    this.questoes[this.currentItem].itemQuestaos.filter(s => s.id === item.id)[0].selecionado = item.selecionado;
  }

  private onContinuarTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonContinuar = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonContinuar = new Color("#FFFFFF");
    }
  }

  private onBreadcrumbTap() {
    // this.router.navigate(['licenciamento/false/breadcrumb']);
    this.toggleDrawer(3);
  }

  private onBreadcrumbTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonBreadcrumb = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonBreadcrumb = new Color("#00b4b9");
    }
  }

  private onVoltarTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonVoltar = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonVoltar = new Color("#FFFFFF");
    }
  }

  private onSaibaMaisTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonSaibaMais = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonSaibaMais = new Color("transparent");
    }
  }

  private onAtividadesSelecionadasTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonAtividadesSelecionadas = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonAtividadesSelecionadas = new Color("transparent");
    }
  }

  private onKeyPress(event) {
    if (this.questoes[this.currentItem].tipoResposta !== "TEXTO") {
      return;
    }
    this.allowNext = this.tipoResposta === "CHECKBOX" ? true : event.value.length > 0;
    this.questoes[this.currentItem].respostaTextoLivre = event.value;
  }

  private onReturnPress() {
    this.onAnswer();
  }

  private openUrl() {
    openUrl(this.urlSaibaMais);
  }

  // BOTTOM SIDEDRAWER
  private closeDrawer() {
    this._drawer.closeDrawer();
  }

  private onDrawerOpened() {
    this.buttonCloseDrawerHeigth = this.drawerComponent.sideDrawer.getActualSize().height - this.drawerComponent.sideDrawer.drawerContentSize - 20;
    this.buttonCloseDrawerWidth = screen.mainScreen.widthDIPs * 0.8;
    this.showBottom = true;
  }

  private onDrawerClosing() {
    this.showBottom = false;
  }

  private ngAfterViewInit() {
    this._drawer = this.drawerComponent.sideDrawer;
    this.changeDetectionRef.detectChanges();
  }

  private onLoaded(args) {
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }

  private toggleDrawer(source: number) {
    this.currentBottomDrawer = source;
    this._drawer.toggleDrawerState();
  }

  private get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition;
  }

  // MENSAGENS MODAL
  private showModal(obj: Object, fn: Function = null) {
    let options: ModalDialogOptions = {
      context: obj,
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };
    this.modalService.showModal(DialogContent, options)
      .then((dialogResult: string) => {
        if (dialogResult === "OK" && typeof (fn) === "function") {
          fn();
        }
      });
  }

  private handleErrors(error: Response) {
    this.isLoading = false;
    this.showModal({ type: "erro-inesperado" });
  }

  // BREADCRUMB
  private onBreadcrumbItemTap(item) {
    if (this.breadcrumbList !== undefined) {
      this.breadcrumbList.forEach(b => {
        b.active = item.index === b.index ? true : false;
      });
    }

    this.changeDetectionRef.detectChanges();
  }

  loadBreadcrumb() {
    this.breadcrumbList = this.ineaController.getBreadcrumb();
    if (this.breadcrumbList !== undefined) {
      this.breadcrumbList.forEach(bc => {
        if (bc.questionarioId === this.questionarioId) {
          bc.active = true;
          bc.current = true;
        }
      });
    }

  }

  onBreadcrumbNavigate(item) {
    this.ineaController.navigateCurrent(item.index);
  }
}
