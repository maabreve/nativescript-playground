import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef, ViewContainerRef } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Page } from "ui/page";
import { isAndroid, isIOS, screen } from "platform";
import { TouchGestureEventData } from "ui/gestures";
import { setTimeout } from "timer";
import { StackLayout } from "ui/layouts/stack-layout";
import { Color } from "color";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import * as application from "application";
let appSettings = require("application-settings");
let platformModule = require("platform");

// DRAWER
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-telerik-ui/sidedrawer";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-telerik-ui/sidedrawer/angular";

// INEA
import { Atividade } from "./atividade.model";
import { AtividadeRecursiva } from "./atividade.model";
import { IneaController } from "../../shared/inea.controller";
import { IneaService } from "../../shared/inea.service";
import { Processo } from "../../shared/processo";
import { Respostas, SelecaoEntidades, AtividadesSelecionadas } from "../../shared/respostas.model";
import { DialogContent } from "../../dialog/dialog-content";
import { Breadcrumb } from "../../shared/breadcrumb.model";

@Component({
    moduleId: module.id,
    selector: "IneaAtividade",
    templateUrl: "./atividade.component.html",
    styleUrls: ["./atividade.component.css"]
})

export class AtividadeComponent implements OnInit, AfterViewInit {
    private atividadeId: number;
    private menuId: number;
    private menuName: string;
    private breadcrumbIndex: number;
    private canBackNavigation: boolean;
    private itensEdicao: Array<any>;
    private selectedCount: number;
    private selectedLabel: string;
    private currentAtividade: string;
    private searchVisible: boolean;
    private buttonColor: string;
    private screenH: number;
    private screenW: number;
    private colorView: string;
    private isLoading: boolean;
    private mindMap: string;
    private idProximaQuestao: number;
    private tituloMenu: string;
    private breadcrumbList: Array<Breadcrumb> = [];
    private atividadeListView: Array<AtividadeRecursiva> = [];
    private atividadeListViewTemp: Array<AtividadeRecursiva> = [];
    private atividadeListViewFull: Array<AtividadeRecursiva> = [];
    private atividadeListCache: Array<AtividadeRecursiva> = [];
    private atividadeListSelect: Array<AtividadeRecursiva> = [];
    private currentBottomDrawer: number;

    private breadCrumb: Array<string> = [];
    private breadcrumbTouch: boolean;
    private breadcrumbColor: string;

    private colorButtonContinuar: string;
    private colorButtonBreadcrumb: string;
    private colorButtonVoltar: string;

    private pesquisaAtividade: string;
    private pesquisarBgColor: string;
    private pesquisarColor: string;
    @ViewChild("sb") private sb: ElementRef;

    private _sideDrawerTransition: DrawerTransitionBase;
    private _drawer: SideDrawerType;
    private drawerContentSize: number = 150;
    @ViewChild(RadSideDrawerComponent) private drawerComponent: RadSideDrawerComponent;
    private buttonCloseDrawerHeigth: number;
    private buttonCloseDrawerWidth: number;
    private showBottom: boolean;

    constructor(private ineaController: IneaController,
        private ineaService: IneaService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private page: Page,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private changeDetectionRef: ChangeDetectorRef) { 

    }

    ngOnInit() {
        this.isLoading = true;
        this.showBottom = false;
        this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
        this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
        this.atividadeListCache = [];
        this.atividadeListView = [];
        this.atividadeListViewTemp = [];
        this.breadCrumb.push("firstView");
        this.breadcrumbTouch = false;
        this.breadcrumbColor = "#FFFFFF";
        this.colorButtonContinuar = "#FFFFFF";
        this.colorButtonVoltar = "#FFFFFF";
        this.colorButtonBreadcrumb = "#00b4b9";
        this.pesquisarColor = "#F5F5F5";
        this.pesquisaAtividade = "";
        this.selectedCount = 0;
        this.selectedLabel = " Selecionados";
        this.currentAtividade = "firstView";
        this.searchVisible = false;
        this.canBackNavigation = this.ineaController.canBackNavigation();
        this.currentBottomDrawer = 1;
        this.loadBreadcrumb();
        this.activatedRoute.params.subscribe(params => {
            this.menuId = params["menuId"];
            this.menuName = params["menuName"];
            this.breadcrumbIndex = +params["breadcrumbIndex"];
            this.itensEdicao = JSON.parse(params["itensEdicao"]);
            this.colorView = params["cor"] !== undefined ? params["cor"] : "#00b4b9";
            this.mindMap = params["mindMap"];
            this.idProximaQuestao = +params["idProximaQuestao"];
            this.tituloMenu = params["tituloMenu"];
            if (this.tituloMenu !== undefined && this.tituloMenu.trim() !== "") {
                this.page.actionBar.title = this.tituloMenu;
            }

            this.page.actionBar.backgroundColor = params["cor"] !== undefined
                ? new Color(params["cor"])
                : new Color("#00b4b9");

            let that = this;

            setTimeout(function () {
                that.pesquisarBgColor = that.colorView;
                that.atividadeListCache = JSON.parse(appSettings.getString("inea-atividades") || "[]");
                that.generateSelecionado(that.atividadeListCache);
                if (that.atividadeListCache.length === 0) {
                    this.showModal({ type: "inea-atividades" });
                }
                else {
                    that.atividadeListView = that.atividadeListCache;
                    that.atividadeListViewTemp = []
                    that.atividadeListView.forEach(a => {
                        that.atividadeListViewTemp.push(a);
                    });

                    that.atividadeListSelect = [];
                    if (that.breadcrumbIndex !== -1) {
                        that.itensEdicao.forEach(item => {
                            that.ineaController.findAtividadeCache(that.atividadeListCache, item.id).selecionado = true;
                        });
                    }

                    that.ineaController.setSelecionadosCache(that.atividadeListCache, that.atividadeListSelect);
                    that.selectedCount = that.atividadeListSelect.length;
                    that.selectedLabel = that.selectedCount === 1 ? " Selecionado" : " Selecionados";

                    that.atividadeListViewFull = [];
                    that.fillAtividadeFull(that.atividadeListCache);

                    if (that.atividadeListView.length === 0) {
                        this.showModal({ type: "inea-atividades-cadastradas" });

                    } else if (that.atividadeListView.length > 1) {
                        that.atividadeListView.sort(function (a, b) {
                            return (a.ordem < b.ordem) ? -1 : (a.ordem > b.ordem) ? 1 : 0;
                        });
                    }
                }

                that.isLoading = false;
                that.changeDetectionRef.detectChanges();

            }, 50);
        });

        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                this._drawer.closeDrawer();
            }
        });

        if (isAndroid) {
            application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
                console.log("ATIVIDADE BACK ANDROID");
                data.cancel = true;
                application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
                this.onNavigationBack();
            });
        }
    }

    private onSearchChange(event) {
        if (event.value.length > 0 && event.value.indexOf("full-width") === -1
            && event.value.indexOf("ng-") === -1) {

            this.sb.nativeElement.backgroundColor = "#F5F5F5";
            this.sb.nativeElement.color = this.colorView;

            this.atividadeListView = [];
            let atividades: Array<AtividadeRecursiva> = [];
            for (let item of this.atividadeListViewFull) {
                if (item.nome != null && item.nome.match(new RegExp("" + event.value, "i"))) {
                    this.atividadeListView.push(new AtividadeRecursiva(item.id, item.nome, item.atividadePaiId,
                        item.selecionado, false, item.possuiQuestionario,
                        item.ordem, item.atividades));
                }
            }
        } else if (event.value.length === 0) {

            this.sb.nativeElement.color = "#F5F5F5";
            this.sb.nativeElement.backgroundColor = this.colorView;

            this.atividadeListView = [];
            this.atividadeListViewTemp.forEach(a => {
                this.atividadeListView.push(new AtividadeRecursiva(a.id, a.nome, a.atividadePaiId,
                    a.selecionado, false, a.possuiQuestionario,
                    a.ordem, a.atividades));
            });
        }

        this.changeDetectionRef.detectChanges();
    }

    private onCheck(item) {
        if (!item.possuiQuestionario)
            return;

        item.selecionado = item.selecionado ? false : true;
        item.selecionado ? this.selectedCount++ : this.selectedCount--;
        this.selectedLabel = this.selectedCount === 1 ? " Selecionado" : " Selecionados";

        if (item.selecionado) {
            let atividade = new AtividadeRecursiva(item.id,
                item.nome,
                item.atividadePaiId,
                true,
                false,
                item.possuiQuestionario,
                item.ordem,
                null);

            this.atividadeListSelect.push(atividade);
            this.ineaController.findAtividadeCache(this.atividadeListCache, item.id).selecionado = true;
            this.atividadeListViewFull.forEach(f => {
                if (f.id === item.id) {
                    f.selecionado = true;
                }
            });
        } else {
            this.onDeleteSelect(item);
        }
    }

    private onDeleteSelect(item) {

        this.isLoading = true;

        for (let i = 0; i < this.atividadeListSelect.length; i++) {
            if (this.atividadeListSelect[i].id === item.id) {
                this.atividadeListSelect.splice(i, 1);
                break;
            };
        }

        let newList: Array<AtividadeRecursiva> = [];
        this.atividadeListView.forEach(atividade => {
            newList.push(atividade);
        });

        this.atividadeListView = [];
        newList.forEach(atividade => {
            this.atividadeListView.push(atividade);
            this.atividadeListViewTemp.push(atividade);
        });

        this.ineaController.findAtividadeCache(this.atividadeListCache, item.id).selecionado = false;

        this.atividadeListViewFull.forEach(f => {
            if (f.id === item.id) {
                f.selecionado = false;
            }
        });

        this.atividadeListViewTemp.forEach(f => {
            if (f.id === item.id) {
                f.selecionado = false;
            }
        });

        this.isLoading = false;
    }

    private onDelete(item) {
        this.showModal({ type: "confirm-remover", msg: "Grupo - " + item.nome }, () => {
            this.selectedCount--;
            this.onDeleteSelect(item);
        });
    }

    private onForward(item) {
        this.isLoading = true;
        let that = this;
        item.botaoAvancar = true;

        setTimeout(function () {
            that.atividadeListView = that.ineaController.findAtividadeCache(that.atividadeListCache, item.id).atividades;
            that.atividadeListViewTemp = []
            that.atividadeListView.forEach(a => {
                that.atividadeListViewTemp.push(a);
            });

            that.currentAtividade = item.nome;
            that.pesquisaAtividade = "";
            if (that.atividadeListView.length === 0) {
                this.showModal({ type: "inea-atividades-cadastradas" });
            }

            that.isLoading = false;
            item.botaoAvancar = false;
            that.changeDetectionRef.detectChanges();

            return that.atividadeListView;
        }, 300);
    }

    private onRewind() {
        this.isLoading = true;
        this.breadcrumbTouch = true;
        this.breadcrumbColor = "#c3c3c3";
        this.breadCrumb.splice(-1, 1);
        this.pesquisaAtividade = "";

        let that = this;

        setTimeout(function () {

            that.atividadeListView = [];
            that.atividadeListViewTemp.forEach(a => {
                that.atividadeListView.push(a);
            });

            let id = that.atividadeListView[0].atividadePaiId;
            let atividadePai = that.ineaController.findAtividadeCache(that.atividadeListCache, id);
            that.currentAtividade = atividadePai.atividadePaiId > 0
                ? that.ineaController.findAtividadeCache(that.atividadeListCache, atividadePai.atividadePaiId).nome
                : "firstView";
            if (id > 0) {
                that.atividadeListView = that.ineaController.findAtividadeCacheParent(that.atividadeListCache, id);

                if (that.atividadeListView.length === 0) {
                    this.showModal({ type: "inea-atividades-cadastradas" });
                } else if (that.atividadeListView.length > 1) {
                    that.atividadeListView.sort(function (a, b) {
                        return (a.ordem < b.ordem) ? -1 : (a.ordem > b.ordem) ? 1 : 0;
                    });
                }
            }

            that.atividadeListViewTemp = [];
            that.atividadeListView.forEach(a => {
                that.atividadeListViewTemp.push(a);
            });

            that.breadcrumbColor = "#FFFFFF";
            that.isLoading = false;
        }, 200);

        this.changeDetectionRef.detectChanges();
        this.breadcrumbTouch = false;
    }

    private onAnswer() {
        this.isLoading = true;
        let atividadesSelecionadas: Array<AtividadesSelecionadas> = [];

        let that = this;
        setTimeout(function () {
            let selecaoEntidadesAtividade: Array<SelecaoEntidades> = [];
            let listSelecioandos: Array<AtividadeRecursiva> = [];
            that.ineaController.setSelecionadosCache(that.atividadeListCache, listSelecioandos);
            listSelecioandos.forEach(item => {
                selecaoEntidadesAtividade.push(new SelecaoEntidades(item.id, "ATIVIDADE", "", null, null));
                atividadesSelecionadas.push(new AtividadesSelecionadas(item.nome, item.nome));
            });
            let processoId = that.ineaController.obterProcesso();
            let etapaTexto = that.mindMap === "true" ? "MIND_MAP" : "ATIVIDADE";
            let mindMapBool: boolean = that.mindMap === "true" ? true : false;

            let respostaAtividade = new Respostas(processoId, that.menuId, etapaTexto, false, 0, false, selecaoEntidadesAtividade);
            that.ineaController.sendAnswers(respostaAtividade, that.menuName, atividadesSelecionadas,
                that.colorView, that.breadcrumbIndex, 0, "", [],
                mindMapBool, that.idProximaQuestao).subscribe(s => {
                    that.isLoading = false;
                }, error => {
                    that.handleErrors(error);
                });

        }, 50);

        if (isAndroid) {
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
        }
    }

    private onNavigationBack() {
        this.isLoading = true;
        let can = this.ineaController.canBackNavigation();
        if (can) {
            this.ineaController.navigateBack(this.breadcrumbIndex);
        } else {
            let submenuId: string = appSettings.getString("inea-submenu-id");
            this.router.navigate(["licenciamento/true/submenu/" + submenuId + "/" + this.colorView]);
        }
    }

    private onVoltarTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonVoltar = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonVoltar = "#FFFFFF";
        }
    }

    private onContinuarTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonContinuar = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonContinuar = "#FFFFFF";
        }
    }

    private onDrawerTap() {
        this._drawer.toggleDrawerState();
    }

    private onBreadcrumbTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonBreadcrumb = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonBreadcrumb = "#00b4b9";
        }
    }

    private generateSelecionado(items) {
        for (let key in items) {

            if (items[key] !== null && typeof items[key] === "object") {
                this.generateSelecionado(items[key]);
            }
            else {
                items["selecionado"] = false;
                if (items["atividades"] === undefined || items["atividades"] === null) {
                    items["atividades"] = [];
                }
            }
        }
    }

    private fillAtividadeFull(items) {
        for (let key in items) {
            if (items[key] !== null && typeof items[key] === "object") {
                this.fillAtividadeFull(items[key]);
            }
            else {

                this.atividadeListViewFull.push(new AtividadeRecursiva(items["id"], items["nome"], items["atividadePaiId"],
                    items["selecionado"], false, items["possuiQuestionario"], items["ordem"], items["atividades"]));

                this.fillAtividadeFull(items["atividades"]);
                break;
            }
        }
    }

    private onPesquisarTouch(args: any) {
        if (args.action === "down") {
            this.sb.nativeElement.backgroundColor = "#F5F5F5";
            this.sb.nativeElement.color = this.colorView;
        }
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

    ngAfterViewInit() {
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
                if (dialogResult == "OK" && typeof (fn) == "function") {
                    fn();
                }
            });
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

    private loadBreadcrumb() {
        this.breadcrumbList = this.ineaController.getBreadcrumb();
        if (this.breadcrumbList !== undefined) {
            this.breadcrumbList.forEach(bc => {
                if (bc.etapa.trim().toUpperCase() === "ATIVIDADE") {
                    bc.active = true;
                    bc.current = true;
                }
            });
        }

    }

    private onBreadcrumbNavigate(item) {
        this.ineaController.navigateCurrent(item.index);
    }

    public handleErrors(error: Response) {
        this.isLoading = false;
        this.showModal({ type: "erro-inesperado" });
    }
}