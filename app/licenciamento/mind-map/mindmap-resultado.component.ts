// Nativescript
import { Component, OnInit } from "@angular/core";
import { Page } from "ui/page";
import { Router, ActivatedRoute } from "@angular/router";
import { Color } from "color";
import { TouchGestureEventData } from "ui/gestures";
import { isAndroid, isIOS, screen } from "platform";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
import * as application from "application";
const appSettings = require("application-settings");

import { Questoes, Respostas, SelecaoEntidades, AtividadesSelecionadas } from "../../shared/respostas.model";
import { IneaController } from "../../shared/inea.controller";

@Component({
  moduleId: module.id,
  templateUrl: "./mindmap-resultado.component.html",
  styleUrls: ["./mindmap-resultado.component.css"],
})

export class MindmapResultadoComponent implements OnInit {
  private menuId: number;
  private menuIdMindMap: number;
  private menuName: string;
  private breadcrumbIndex: number;
  private itensEdicao: Array<any>;
  private colorView: string;
  private mindMap: boolean;
  private idProximaQuestao: number;
  private questionarioId: number;
  private nomeQuestionario: string;
  private questoes: Array<Questoes> = [];
  private etapa: string;
  private atividadesSelecionadas: Array<AtividadesSelecionadas>;
  private instrumentoMindMap: string;
  private instrumentoMindMapList: Array<string>;
  private colorButtonContinuar: Color;
  private colorButtonProsseguir: Color;
  private isLoading: boolean;
  private screenH: number;
  private screenW: number;
  private tituloMenu: string;

  /****** Constructor ******/
  constructor(private ineaController: IneaController,
    private page: Page,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  /****** NS Events ******/
  ngOnInit() {

    this.colorButtonContinuar = new Color("#FFFFFF");
    this.colorButtonProsseguir = new Color("transparent");
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;

    this.activatedRoute.params.subscribe(params => {
      this.menuId = params["menuId"];
      this.menuIdMindMap = params["menuIdMindMap"];
      this.menuName = params["menuName"];
      this.breadcrumbIndex = +params["breadcrumbIndex"];
      this.itensEdicao = JSON.parse(params["itensEdicao"]);
      this.colorView = params["cor"] !== undefined ? params["cor"] : "#00b4b9";
      this.mindMap = params["mindMap"];
      this.idProximaQuestao = params["idProximaQuestao"] !== undefined ? +params["idProximaQuestao"] : 0;
      this.etapa = params["etapa"];
      this.questionarioId = +params["questionarioId"];
      this.nomeQuestionario = params["nomeQuestionario"];
      this.questoes = JSON.parse(params["questoes"]);
      this.atividadesSelecionadas = params["atividadesSelecionadas"];
      this.instrumentoMindMap = params["instrumentoMindMap"];
      this.instrumentoMindMapList = this.instrumentoMindMap.split("|");
      this.tituloMenu = params["tituloMenu"];

      if (this.instrumentoMindMapList !== undefined && this.instrumentoMindMapList.length > 0) {
        if (this.instrumentoMindMapList[this.instrumentoMindMapList.length - 1].trim() === "") {
          this.instrumentoMindMapList.length = this.instrumentoMindMapList.length - 1;
        }
      }
    });

    if (isAndroid) {
      application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
        data.cancel = true;
        application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
        this.onNavigationBack();
      });
    }
  }

  private onTapContinuar() {
    let fimMindmap: boolean = appSettings.getBoolean("inea-fim-mindmap");
    if (this.idProximaQuestao > 0) {
      this.isLoading = true;
      let processoId = this.ineaController.obterProcesso();

      let resposta = new Respostas(processoId, this.menuIdMindMap, "MIND_MAP", false, this.idProximaQuestao, true, []);

      /*
      if (isAndroid) {
        application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
      }
      */

      let that = this;
      setTimeout(function () {
        that.ineaController.sendAnswers(resposta, that.menuName, [], that.colorView, that.breadcrumbIndex, 0, "", [], true, that.idProximaQuestao)
          .subscribe(s => {
            that.isLoading = false;
          });
      }, 200);
    } else {
      appSettings.setBoolean("inea-executou-mindmap", true);
      this.finalizar();
    }
  }

  private finalizar() {
    this.isLoading = true;

    if (this.page.actionBar.title === "PRECISO DE AJUDA") {
      this.page.actionBar.title =
        this.instrumentoMindMapList !== undefined && this.instrumentoMindMapList.length > 0
        ? this.instrumentoMindMapList[0].toUpperCase()
        : "";
    }

    if (isAndroid) {
      application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
    }

    let that = this;
    setTimeout(function () {
      that.page.actionBar.title = that.tituloMenu;
      that.ineaController.navigate(that.etapa, that.menuIdMindMap, that.menuId, that.menuName,
        that.atividadesSelecionadas,
        that.questionarioId, that.nomeQuestionario, that.questoes,
        "", that.colorView, that.breadcrumbIndex, that.itensEdicao,
        that.mindMap, that.idProximaQuestao, "", this.tituloMenu, "");
    }, 200);
  }

  private onContinuarTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonContinuar = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonContinuar = new Color("#FFFFFF");
    }
  }

  private onProsseguirTouch(args: TouchGestureEventData) {
    if (args.action === "down") {
      this.colorButtonProsseguir = new Color("#C3C3C3");
    } else if (args.action === "up" || args.action === " cancel") {
      this.colorButtonProsseguir = new Color("transparent");
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
}