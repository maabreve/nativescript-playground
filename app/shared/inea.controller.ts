import { Injectable, Component } from "@angular/core";
import { Observable, Subscription } from "rxjs/Rx";
import { Router } from "@angular/router";
import * as appSettings from "application-settings";

import { Config } from "./config";
import { IneaService } from "./inea.service";
import { Processo } from "./processo";
import { Menu } from "../licenciamento/menu/menu.model";
import { Breadcrumb } from "./breadcrumb.model";
import { Carrinho } from "./carrinho.model";
import { Questoes, Respostas, SelecaoEntidades, RespostasRetorno, AtividadesSelecionadas } from "./respostas.model";

@Injectable()
export class IneaController {

    constructor(private router: Router,
        private ineaService: IneaService) {
    }

    /*************************************************
     *                  PROCESSOS
    ************************************************/
    public criarProcesso() {
        appSettings.setString("inea-breadcrumb", "[]");
        appSettings.setNumber("inea-breadcrumb-currentIndex", -1);
        appSettings.setString("inea-itens-carrinho", "");
        appSettings.setBoolean("inea-fim-mindmap", false);
        appSettings.setBoolean("inea-iniciou-repostas", false);

        return this.ineaService.criarProcesso()
            .subscribe(novoprocessoid => {
                appSettings.setNumber("inea-current-processo", novoprocessoid);
                return novoprocessoid;
            });
    }

    public obterProcesso() {
        let processoId = appSettings.getNumber("inea-current-processo");
        if (processoId === 0) {
            this.ineaService.criarProcesso().subscribe(
                (id) => {
                    appSettings.setNumber("inea-current-processo", id);
                    return id;
                }
            );

        } else {

            return processoId;
        }
    }


    /*************************************************
     *        MANIPULADORES RESPOSTAS VIEWS
    ************************************************/
    public sendAnswers(respostas: Respostas,
        menuName: string,
        atividadesSelecionadas: Array<AtividadesSelecionadas>,
        colorView: string,
        breadcrumbIndexEdit: number,
        questionarioId: number,
        questionarioNome: string,
        questoes: Array<Questoes>,
        mindMap: boolean,
        idProximaQuestao: number): Observable<any> {

        let breadcrumbArray: Array<Breadcrumb> = JSON.parse(appSettings.getString("inea-breadcrumb"));
        let currentIndex: number = appSettings.getNumber("inea-breadcrumb-currentIndex");

        // edicao
        if (breadcrumbIndexEdit !== -1) {
            let currentBreadcrumb = breadcrumbArray[breadcrumbIndexEdit];
            let selecaoEntidades: any;

            selecaoEntidades = respostas.selecaoEntidades;

            // não houve mudança nas respostas
            if (JSON.stringify(currentBreadcrumb.respostas)
                === JSON.stringify(selecaoEntidades)) {

                let nextBreadcrumb = breadcrumbArray[breadcrumbIndexEdit + 1];
                this.navigate(nextBreadcrumb.etapa,
                    nextBreadcrumb.menuId,
                    nextBreadcrumb.menuIdMindMap,
                    nextBreadcrumb.menuName,
                    nextBreadcrumb.atividadesSelecionadas,
                    nextBreadcrumb.questionarioId,
                    nextBreadcrumb.questionarioNome,
                    nextBreadcrumb.questoes,
                    nextBreadcrumb.resultadosMobile,
                    nextBreadcrumb.colorView, breadcrumbIndexEdit + 1,
                    nextBreadcrumb.respostas, nextBreadcrumb.mindMap,
                    nextBreadcrumb.idProximaQuestao,
                    "",
                    nextBreadcrumb.tituloMenu);

                return Observable.of();
            }
            // houve mudanças nas respostas
            else {
                let respostaApi: string = "";
                let selecaoEntidades: string = "";
                respostas.voltar = true;
                return this.sendAnswersApi(respostas,
                    respostas.menuId,
                    menuName,
                    atividadesSelecionadas,
                    colorView,
                    breadcrumbArray,
                    breadcrumbIndexEdit,
                    mindMap,
                    questionarioId,
                    questionarioNome,
                    questoes,
                    "",
                    currentBreadcrumb.idProximaQuestao,
                    currentBreadcrumb.instrumentoMindMap).catch(this.handleErrors);
            }
        }
        // novo
        else {
            respostas.voltar = false;
            return this.sendAnswersApi(respostas,
                respostas.menuId,
                menuName,
                atividadesSelecionadas,
                colorView,
                breadcrumbArray,
                currentIndex,
                mindMap,
                questionarioId,
                questionarioNome,
                questoes,
                "",
                idProximaQuestao,
                breadcrumbArray[currentIndex].instrumentoMindMap).catch(this.handleErrors);
        }
    }

    private sendAnswersApi(respostaApi: Respostas,
        menuId: number,
        menuName: string,
        atividadesSelecionadas: Array<AtividadesSelecionadas>,
        colorView: string,
        breadcrumbArray: Array<any>,
        currentIndex: number,
        mindMap: boolean,
        questionarioId: number,
        questionarioNome: string,
        questoes: Array<Questoes>,
        resultadosMobile: string,
        idProximaQuestao: number = 0,
        instrumentoMindMap: string): Observable<any> {

        console.log("--------------------------------------");
        console.log("RESPOSTAS ENVIADAS PARA A API ", JSON.stringify(respostaApi));

        return this.ineaService.gravarRespostas(JSON.stringify(respostaApi))
            .map(resposta => {

                console.log("--------------------------------------");
                console.log("RETORNO API ", JSON.stringify(resposta));

                // Trata resposta questionario
                if (resposta.etapa === "QUESTIONARIO") {
                    if (!resposta.questoes || resposta.questoes.length === 0) {
                        alert("Questionário sem questões cadastradas.");
                        return;
                    }
                }

                // Trata resposta mindmap
                if (resposta.etapa === "MIND_MAP") {

                    // REGRA: Tratamento para mindmap sem questoes cadastradas
                    if (!resposta.questoes || resposta.questoes.length === 0) {

                        // console.log("--------------------------------------");
                        // console.log("MINDMAP SEM QUESTOES - BUSCA CACHE", new Date());

                        let itensCarrinho = appSettings.getString("inea-itens-carrinho");

                        // Se existe itens no carrinho
                        if (itensCarrinho && itensCarrinho.trim().length > 0) {
                            // console.log("--------------------------------------");
                            // console.log("RETORNOU CACHE MIND MAP ", JSON.parse(itensCarrinho));

                            // converte cache em objeto
                            let itensCarrinhoObj: Carrinho = JSON.parse(itensCarrinho) || undefined;

                            // REGRA: MindMap sem questoes cadastradas e sem itens no carrinho, envia msg
                            if (itensCarrinhoObj === undefined) {
                                alert("Questionário sem questões cadastradas.");
                            } else {

                                // REGRA: MindMap sem questoes cadastradas e com itens no carrinho,
                                // acaba o mindmap e navega p tela do carrinho

                                // REGRA: se a api enviou novo instrumento no carrinho, atualiza o carrinho,
                                // senao pega do cache
                                let carrinho = resposta.instrumentoMindMap !== undefined
                                    ? resposta.instrumentoMindMap : itensCarrinhoObj.instrumentoMindMap;

                                // console.log("Cache Carrinho ", itensCarrinhoObj.menuId, itensCarrinhoObj.etapa, itensCarrinhoObj.questionarioId);
                                // console.log("Resposta Api ", resposta.menuId, resposta.etapa, resposta.questionarioId);

                                // Navega p tela do carrinho, passando parametros do cache + carrinho atualizado
                                // com idProximaQuestao = 0 para forçar o termino do Mindmap

                                // Adiciona item no carrinho
                                this.adicionarCarrinho(itensCarrinhoObj.menuId,
                                    itensCarrinhoObj.menuIdMindMap,
                                    itensCarrinhoObj.menuName,
                                    itensCarrinhoObj.atividadesSelecionadas,
                                    itensCarrinhoObj.colorView,
                                    itensCarrinhoObj.breadcrumbIndex,
                                    itensCarrinhoObj.itens,
                                    itensCarrinhoObj.mindMap,
                                    0,
                                    itensCarrinhoObj.etapa,
                                    itensCarrinhoObj.questionarioId,
                                    itensCarrinhoObj.questionarioNome,
                                    itensCarrinhoObj.questoes,
                                    carrinho,
                                    itensCarrinhoObj.tituloMenu);

                                this.router.navigate(["licenciamento/false/mindmapResultado",
                                    itensCarrinhoObj.menuId,
                                    itensCarrinhoObj.menuIdMindMap,
                                    itensCarrinhoObj.menuName,
                                    itensCarrinhoObj.atividadesSelecionadas,
                                    itensCarrinhoObj.colorView,
                                    itensCarrinhoObj.breadcrumbIndex,
                                    itensCarrinhoObj.itens,
                                    itensCarrinhoObj.mindMap,
                                    0,
                                    itensCarrinhoObj.etapa,
                                    itensCarrinhoObj.questionarioId,
                                    itensCarrinhoObj.questionarioNome,
                                    itensCarrinhoObj.questoes,
                                    carrinho,
                                    itensCarrinhoObj.tituloMenu]);
                            }
                        }
                        // REGRA: Mindmap sem questoes cadastradas e sem itens no carrinho, envia msg
                        else {
                            alert("Questionário sem questões cadastradas.");
                        }

                        // Retorna o metodo
                        return;
                    }
                }

                let menuIdMindMap: number = resposta.menuId ? resposta.menuId : menuId;
                // console.log("MENU ID MINDMAP ", menuIdMindMap);

                let tituloMenu: string = resposta.tituloMenu !== undefined ? resposta.tituloMenu.toUpperCase() : "";

                // Altera breadcrumb
                this.changeBreadcrumbItem(respostaApi.etapa,
                    menuId,
                    menuIdMindMap,
                    menuName,
                    atividadesSelecionadas,
                    questionarioId,
                    questionarioNome,
                    questoes,
                    resultadosMobile,
                    respostaApi.selecaoEntidades,
                    colorView,
                    currentIndex,
                    mindMap,
                    idProximaQuestao,
                    instrumentoMindMap,
                    tituloMenu);

                // Navega p view
                this.navigate(resposta.etapa, menuId, menuIdMindMap, menuName, atividadesSelecionadas,
                    resposta.questionarioId, resposta.nomeQuestionario, resposta.questoes,
                    resposta.resultadosMobile, colorView, -1, [], resposta.mindMap,
                    resposta.idProximaQuestao, resposta.instrumentoMindMap, tituloMenu);

                return "";
            }
            ,
            err => {
                return Observable.throw(err);
            }
            );

    }

    /*************************************************
     *              NAVEGACAO
    ************************************************/
    public navigate(etapa: string = "",
        menuId: number = 0,
        menuIdMindMap: number = 0,
        menuName: string = "",
        atividadesSelecionadas: Array<AtividadesSelecionadas> = [],
        questionarioId: number = 0,
        questionarioNome: string = "",
        questoes: Array<Questoes> = [],
        resultadosMobile: string = "",
        colorView: string = "",
        breadcrumbIndex: number = 0,
        itens: Array<any> = [],
        mindMap: boolean = false,
        idProximaQuestao: number = 0,
        instrumentoMindMap: string = "",
        tituloMenu: string = "",
        qciId: string = "") {

        let nomeEtapa: string = "";

        // Tratamento inconsistencias Api
        if (etapa === "MIND_MAP") {
            if (questoes !== undefined && questoes.length > 0 && questoes[0].nome !== undefined) {
                nomeEtapa = questoes[0].nome;
            } else {
                // TODO: Trocar p responder Observable
                alert("Questão sem nome cadastrado.");
                return;
            }
        } else {
            nomeEtapa = questionarioNome;
        }

        let etapaTexto: string = this.getEtapaTexto(etapa, nomeEtapa);

        // REGRA: Se existem itens no carrinho e ainda nao acabou o mind map
        // OBS: implementação no App devido a inconsistencia Api
        let fimMindmap: boolean = appSettings.getBoolean("inea-fim-mindmap");
        if (instrumentoMindMap && instrumentoMindMap !== "") {

            /**
             *  VARIÁVEIS 
             *  idProximaQuestao => variável que a api retorna e se for = 0, sinaliza que é fim do mindmap.
             *  fimMindmap => cache da app que é setado para true na primeira vez que a api enviar idProximaQuestao = 0.
            */

            // OBS: Regra implementada para resolver problema do retorno da Api:
            // Se o idProximaQuestao for > 0 (ainda nao ser fim do mindMap) E nao ter vindo idProximaQuestao = 0 nenhuma vez no processo, mostra o carrinho.
            if (idProximaQuestao > 0 && !fimMindmap) {
                let currentIndex: number = appSettings.getNumber("inea-breadcrumb-currentIndex") + 1;

                // Armazena indice corrente
                appSettings.setNumber("inea-breadcrumb-currentIndex", currentIndex);

                // Armazena breadcrumb voltar
                this.gravarBreadcrumb(currentIndex,
                    etapa,
                    etapaTexto,
                    menuId,
                    menuIdMindMap,
                    menuName,
                    atividadesSelecionadas,
                    questionarioId,
                    questionarioNome,
                    questoes,
                    resultadosMobile,
                    [],
                    colorView,
                    mindMap,
                    idProximaQuestao,
                    instrumentoMindMap,
                    tituloMenu);

                // Salva ultimo estado do carrinho
                this.adicionarCarrinho(menuIdMindMap,
                    menuId,
                    menuName,
                    atividadesSelecionadas,
                    colorView,
                    breadcrumbIndex,
                    JSON.stringify(itens),
                    mindMap,
                    idProximaQuestao,
                    etapa,
                    questionarioId,
                    questionarioNome,
                    JSON.stringify(questoes),
                    instrumentoMindMap,
                    tituloMenu);

                // Navega p carrinho
                this.router.navigate(["licenciamento/false/mindmapResultado",
                    menuIdMindMap,
                    menuId,
                    menuName,
                    atividadesSelecionadas,
                    colorView,
                    breadcrumbIndex,
                    JSON.stringify(itens),
                    mindMap,
                    idProximaQuestao,
                    etapa,
                    questionarioId,
                    questionarioNome,
                    JSON.stringify(questoes),
                    instrumentoMindMap,
                    tituloMenu]);

                return;
            } else {
                // Caso contrário, verfica se é o primeiro instrumento do carrinho que vai ser respondido
                menuId = menuIdMindMap;
                appSettings.setBoolean("inea-fim-mindmap", true);
                let executouMindMap: boolean = appSettings.getBoolean("inea-iniciou-repostas") || false;
                if (!executouMindMap) {

                    // Mostra o carrinho antes de responder o primeiro instrumento
                    let itensCarrinho = appSettings.getString("inea-itens-carrinho");
                    let itensCarrinhoObj: Carrinho = JSON.parse(itensCarrinho) || undefined;
                    if (itensCarrinhoObj) {
                        instrumentoMindMap = itensCarrinhoObj.instrumentoMindMap;
                    }

                    appSettings.setBoolean("inea-iniciou-repostas", true);

                    // Salva ultimo estado do mindMap
                    this.adicionarCarrinho(menuIdMindMap,
                        menuId,
                        menuName,
                        atividadesSelecionadas,
                        colorView,
                        breadcrumbIndex,
                        JSON.stringify(itens),
                        mindMap,
                        idProximaQuestao,
                        etapa,
                        questionarioId,
                        questionarioNome,
                        JSON.stringify(questoes),
                        instrumentoMindMap,
                        tituloMenu);

                    this.router.navigate(["licenciamento/false/mindmapResultado",
                        menuIdMindMap,
                        menuId,
                        menuName,
                        atividadesSelecionadas,
                        colorView,
                        breadcrumbIndex,
                        JSON.stringify(itens),
                        mindMap,
                        idProximaQuestao,
                        etapa,
                        questionarioId,
                        questionarioNome,
                        JSON.stringify(questoes),
                        instrumentoMindMap,
                        tituloMenu]);

                    return;

                }
            }
        }

        if (etapa === "") {
            alert("Próxima etapa não cadastrada.");
            return;
        }

        if (etapa === "ATIVIDADE" ||
            etapa === "MUNICIPIO" ||
            etapa === "LICENCA" ||
            etapa === "QUESTIONARIO" ||
            etapa === "MIND_MAP") {

            if (etapa === "QUESTIONARIO" ||
                etapa === "MIND_MAP") {
                if (questoes.length === 0) {
                    alert("Questionário sem questões cadastradas.");
                    return;
                }
            }

            if (breadcrumbIndex === -1) {
                let currentIndex: number = appSettings.getNumber("inea-breadcrumb-currentIndex") + 1;
                appSettings.setNumber("inea-breadcrumb-currentIndex", currentIndex);

                this.gravarBreadcrumb(currentIndex, etapa, etapaTexto, menuId, menuIdMindMap, menuName, atividadesSelecionadas,
                    questionarioId, questionarioNome, questoes, resultadosMobile, [],
                    colorView, mindMap, idProximaQuestao,
                    instrumentoMindMap, tituloMenu);

            } else {

                appSettings.setNumber("inea-breadcrumb-currentIndex", breadcrumbIndex);
            }


        }
        else if (etapa !== "MENU" &&
            etapa !== "RESULTADO") {
            alert("Próxima etapa não cadastrada.");
            return;
        }

        if (!colorView || colorView === "") {
            colorView = "#006eb9";
        }

        // Navegação
        switch (etapa) {
            case "MENU":
                this.router.navigate(["licenciamento/false/submenu", menuId, colorView]);
                break;
            case "LICENCA":
                this.router.navigate(["licenciamento/false/licenca", menuId, menuName, JSON.stringify(atividadesSelecionadas), colorView,
                    breadcrumbIndex, JSON.stringify(itens), tituloMenu]);
                break;
            case "ATIVIDADE":
                this.router.navigate(["/licenciamento/false/atividade", menuId, menuName, JSON.stringify(atividadesSelecionadas), colorView,
                    breadcrumbIndex, JSON.stringify(itens), mindMap, idProximaQuestao, tituloMenu]);
                break;
            case "MUNICIPIO":
                this.router.navigate(["licenciamento/false/municipio", menuId, menuName, JSON.stringify(atividadesSelecionadas), colorView,
                    breadcrumbIndex, JSON.stringify(itens), tituloMenu]);
                break;
            case "QUESTIONARIO":
                this.router.navigate(["licenciamento/false/questionario", menuId, menuName, etapa, questionarioId,
                    questionarioNome, JSON.stringify(questoes), JSON.stringify(atividadesSelecionadas), colorView,
                    breadcrumbIndex, JSON.stringify(itens), false, tituloMenu]);
                break;
            case "MIND_MAP":
                this.router.navigate(["licenciamento/false/questionario", menuId, menuName, etapa, questionarioId,
                    questionarioNome, JSON.stringify(questoes), JSON.stringify(atividadesSelecionadas), colorView,
                    breadcrumbIndex, JSON.stringify(itens), true, tituloMenu]);
                break;
            case "RESULTADO":
                appSettings.setString("inea-breadcrumb", "[]");
                appSettings.setNumber("inea-breadcrumb-currentIndex", -1);
                if (qciId !== "") {
                    let email = appSettings.getString("email");
                    this.ineaService.obterDocumentoMenu(qciId, email).subscribe(result => {
                        let resultado = JSON.parse(JSON.stringify(result));
                        this.router.navigate(["licenciamento/false/resultado", JSON.stringify(resultado.resultadosMobile), menuName, etapa]);
                    });

                } else {
                    this.router.navigate(["licenciamento/false/resultado", JSON.stringify(resultadosMobile), menuName, etapa]);
                }
                break;
        }
    }

    public canBackNavigation() {
        let currentIndex: number = appSettings.getNumber("inea-breadcrumb-currentIndex");
        return currentIndex > 0;
    }

    public navigateBack(index) {
        // breadcrumb
        let breadcrumbArray: Array<Breadcrumb> = JSON.parse(appSettings.getString("inea-breadcrumb"));
        let currentIndex: number = appSettings.getNumber("inea-breadcrumb-currentIndex") - 1;
        let breadCrumbCurrent: Breadcrumb = JSON.parse(JSON.stringify(breadcrumbArray[currentIndex]));

        this.navigate(breadCrumbCurrent.etapa,
            breadCrumbCurrent.menuId,
            breadCrumbCurrent.menuIdMindMap,
            breadCrumbCurrent.menuName,
            breadCrumbCurrent.atividadesSelecionadas,
            breadCrumbCurrent.questionarioId,
            breadCrumbCurrent.questionarioNome,
            breadCrumbCurrent.questoes,
            breadCrumbCurrent.resultadosMobile,
            breadCrumbCurrent.colorView,
            currentIndex,
            breadCrumbCurrent.respostas,
            breadCrumbCurrent.mindMap,
            breadCrumbCurrent.idProximaQuestao,
            "",
            breadCrumbCurrent.tituloMenu);

    }

    public navigateCurrent(index) {
        // breadcrumb
        let breadcrumbArray: Array<Breadcrumb> = JSON.parse(appSettings.getString("inea-breadcrumb"));
        let breadCrumbCurrent: Breadcrumb = JSON.parse(JSON.stringify(breadcrumbArray[index]));


        this.navigate(breadCrumbCurrent.etapa,
            breadCrumbCurrent.menuId,
            breadCrumbCurrent.menuIdMindMap,
            breadCrumbCurrent.menuName,
            breadCrumbCurrent.atividadesSelecionadas,
            breadCrumbCurrent.questionarioId,
            breadCrumbCurrent.questionarioNome,
            breadCrumbCurrent.questoes,
            breadCrumbCurrent.resultadosMobile,
            breadCrumbCurrent.colorView,
            index,
            breadCrumbCurrent.respostas,
            breadCrumbCurrent.mindMap,
            breadCrumbCurrent.idProximaQuestao,
            "",
            breadCrumbCurrent.tituloMenu);

    }

    /*************************************************
     *              BREADCRUMB
    ************************************************/
    private changeBreadcrumbItem(etapa: string, menuId: number, menuIdMindMap: number, menuName: string,
        atividadesSelecionadas: Array<AtividadesSelecionadas>, questionarioId: number, questionarioNome: string,
        questoes: Array<Questoes> = [], resultadoMobile: string,
        selecaoEntidades: Array<SelecaoEntidades>, colorView: string,
        breadcrumbIndexEdit: number, mindMap: boolean, idProximaQuestao: number,
        instrumentoMindMap: string, tituloMenu: string) {

        let breadcrumbArray: Array<Breadcrumb> = JSON.parse(appSettings.getString("inea-breadcrumb"));

        // Respostas
        let respostaTexto: string = "";
        switch (etapa) {
            case "ATIVIDADE":
                let atividadesCache = JSON.parse(appSettings.getString("inea-atividades") || "[]");
                if (atividadesCache && selecaoEntidades) {
                    selecaoEntidades.forEach(resp => {
                        let atividade = this.findAtividadeCache(atividadesCache, resp.id);
                        if (atividade) {
                            if (respostaTexto === "") {
                                respostaTexto += atividade.nome;
                            } else {
                                respostaTexto += " / " + atividade.nome;
                            }
                        }
                    });
                }
                break;
            case "LICENCA":
                let tiposLicencaCache = JSON.parse(appSettings.getString("inea-tipos-licenca") || "[]");
                if (tiposLicencaCache && selecaoEntidades) {
                    selecaoEntidades.forEach(resp => {
                        let tipoLicenca = this.findTipoLicenca(tiposLicencaCache, resp.id);
                        respostaTexto = resp.resposta + " - " + tipoLicenca.nome;
                    });
                }
                break;
            case "MUNICIPIO":
                let municipiosCache = JSON.parse(appSettings.getString("inea-municipios") || "[]");
                if (municipiosCache && selecaoEntidades) {
                    selecaoEntidades.forEach(resp => {
                        let municipio = this.findMunicipio(municipiosCache, resp.id);
                        if (municipiosCache) {
                            if (respostaTexto === "") {
                                respostaTexto += municipio.nome;
                            } else {
                                respostaTexto += " / " + municipio.nome;
                            }
                        }
                    });
                }
                break;
            case "QUESTIONARIO":
            case "MIND_MAP":
                questoes.forEach(questao => {
                    if (questao.itemQuestaos !== undefined && questao.itemQuestaos.length > 0) {
                        questao.itemQuestaos.forEach(itemQuestao => {
                            if (itemQuestao.selecionado) {
                                if (respostaTexto === "") {
                                    respostaTexto += itemQuestao.nome;
                                } else {
                                    respostaTexto += " / " + itemQuestao.nome;
                                }
                            }
                        });
                    }
                })
                break;
        }
        let nomeEtapa: string = "";
        if (etapa === "MIND_MAP") {
            if (questoes && questoes.length > 0 && questoes[0].nome !== undefined) {
                nomeEtapa = questoes && questoes.length > 0 ? questoes[0].nome : " ";
            }
        } else {
            nomeEtapa = questionarioNome;
        }

        let etapaTexto: string = this.getEtapaTexto(etapa, nomeEtapa);

        let breadcrumb = new Breadcrumb(breadcrumbIndexEdit, etapa, etapaTexto,
            menuId,
            menuIdMindMap,
            menuName,
            atividadesSelecionadas,
            questionarioId,
            questionarioNome,
            questoes,
            resultadoMobile,
            colorView,
            selecaoEntidades,
            respostaTexto,
            false,
            mindMap,
            idProximaQuestao,
            instrumentoMindMap,
            tituloMenu,
            false);

        breadcrumbArray[breadcrumbIndexEdit] = breadcrumb;

        // deleta indices posteriores
        breadcrumbArray.length = breadcrumbIndexEdit + 1;
        appSettings.setString("inea-breadcrumb", JSON.stringify(breadcrumbArray));

        // // console.log("--------------------------------------");
        // // console.log("ALTEROU BREADCRUMB ", JSON.stringify(breadcrumbArray));
    }

    private gravarBreadcrumb(currentIndex: number,
        etapa: string,
        etapaTexto: string,
        menuId: number,
        menuIdMindMap: number,
        menuName: string,
        atividadesSelecionadas: Array<AtividadesSelecionadas>,
        questionarioId: number,
        questionarioNome: string,
        questoes: Array<Questoes>,
        resultadoMobile: string,
        selecaoEntidades: Array<SelecaoEntidades>,
        colorView: string,
        mindMap: boolean,
        idProximaQuestao: number,
        instrumentoMindMap: string,
        tituloMenu: string) {

        let breadcrumbArray: Array<Breadcrumb> = JSON.parse(appSettings.getString("inea-breadcrumb"));;
        let breadcrumb = new Breadcrumb(currentIndex, etapa, etapaTexto,
            menuId,
            menuIdMindMap,
            menuName,
            atividadesSelecionadas,
            questionarioId,
            questionarioNome,
            questoes,
            resultadoMobile,
            colorView,
            selecaoEntidades,
            "",
            false,
            mindMap,
            idProximaQuestao,
            instrumentoMindMap,
            tituloMenu,
            false);

        breadcrumbArray.push(breadcrumb);
        appSettings.setString("inea-breadcrumb", JSON.stringify(breadcrumbArray));

        // // console.log("--------------------------------------");
        // // console.log("NOVO BREADCRUMB ", JSON.stringify(breadcrumbArray));

    }

    private adicionarCarrinho(menuIdMindMap: number,
        menuId: number,
        menuName: string,
        atividadesSelecionadas: Array<AtividadesSelecionadas>,
        colorView: string,
        breadcrumbIndex: number,
        itens: string,
        mindMap: boolean,
        idProximaQuestao: number,
        etapa: string,
        questionarioId: number,
        questionarioNome: string,
        questoes: string,
        instrumentoMindMap: string,
        tituloMenu: string) {

        let carrinho = new Carrinho(menuIdMindMap,
            menuId,
            menuName,
            atividadesSelecionadas,
            colorView,
            breadcrumbIndex,
            itens,
            mindMap,
            idProximaQuestao,
            etapa,
            questionarioId,
            questionarioNome,
            questoes,
            instrumentoMindMap,
            tituloMenu);

        appSettings.setString("inea-itens-carrinho", JSON.stringify(carrinho));

        // // console.log("--------------------------------------");
        // // console.log("NOVO BREADCRUMB MINDMAP ", JSON.stringify(breadcrumb));
    }

    private getEtapaTexto(etapa: string, questionarioNome: string) {
        switch (etapa) {
            case "ATIVIDADE":
                return "SELECIONE SUAS ATIVIDADES";
            case "MUNICIPIO":
                return "SELECIONE SUA REGIÃO";
            case "LICENCA":
                return "SELECIONE O TIPO DA LICENÇA";
            case "QUESTIONARIO":
            case "MIND_MAP":
                return questionarioNome.toUpperCase();
        }
    }

    public getBreadcrumb(): Array<Breadcrumb> {
        return JSON.parse(appSettings.getString("inea-breadcrumb"));
    }

    /*************************************************
     *              HELPERS
    ************************************************/
    private desmarcaRecursivo(obj) {
        for (let key in obj) {
            if (obj[key] !== null && typeof obj[key] === "object") {
                this.desmarcaRecursivo(obj[key]);
            }
            else {
                if (key === "selecionado" && obj[key] === true) {
                    obj[key] = false;
                }
            }
        }
    }

    public setSelecionadosCache(obj, novaListSelecionados) {
        for (let key in obj) {
            if (obj[key] !== null && typeof obj[key] === "object") {
                this.setSelecionadosCache(obj[key], novaListSelecionados);
            }
            else {
                if (key === "selecionado" && obj[key] === true) {
                    novaListSelecionados.unshift(obj);
                }
            }
        }
    }

    public findAtividadeCache(subItems, idAtividade) {
        if (subItems) {
            for (let i = 0; i < subItems.length; i++) {
                if (subItems[i].id === idAtividade) {
                    return subItems[i];
                };
                let found = this.findAtividadeCache(subItems[i].atividades, idAtividade);
                if (found) return found;
            }
        }
    }

    public findAtividadeCacheParent(subItems, atividadePaiId) {
        if (subItems) {
            for (var i = 0; i < subItems.length; i++) {
                if (subItems[i].id === atividadePaiId) {
                    return subItems;
                };
                var found = this.findAtividadeCacheParent(subItems[i].atividades, atividadePaiId);
                if (found) return found;
            }
        }
    }

    public findMunicipio(subItems, id) {
        if (subItems) {
            for (var i = 0; i < subItems.length; i++) {
                if (subItems[i].id === id) {
                    return subItems[i];
                };
                var found = this.findMunicipio(subItems[i].atividades, id);
                if (found) return found;
            }
        }
    }

    public findTipoLicenca(subItems, id) {
        if (subItems) {
            for (let i = 0; i < subItems.length; i++) {
                if (subItems[i].id === id) {
                    return subItems[i];
                };
            }
        }
    }

    private findMenuRecursivo(subItems, id) {
        if (subItems) {
            for (let i = 0; i < subItems.length; i++) {
                if (subItems[i].id === id) {
                    return subItems[i];
                };
                let found = this.findMenuRecursivo(subItems[i].menus, id);
                if (found) return found;
            }
        }
    }

    public findTituloMenu(menuId: number): string {
        let menuCache = JSON.parse(appSettings.getString("inea-menus") || "[]");

        if (menuCache.length === 0) {
            return "";
        }

        let menu = this.findMenuRecursivo(menuCache, menuId);

        return menu !== undefined ? menu.titulo : "";
    }

    handleErrors(error: Response) {
        console.log("Erro: Inea Controller: " + error);
        return Observable.throw(error);
    }

}
