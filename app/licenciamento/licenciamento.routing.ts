// Nativescript
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Inea
import { LoadingComponent } from "./loading.component";
import { HomepageComponent } from "./homepage.component";
import { LicenciamentoComponent } from "./licenciamento.component";
import { MenuComponent } from "./menu/menu.component";
import { MindmapResultadoComponent } from "./mind-map/mindmap-resultado.component";
import { AuthGuard } from "../auth-guard.service";

const licenciamentoRoutes: Routes = [
  { path: "loading", component: LoadingComponent },
  { path: "licenciamento/:hideDrawer", component: LicenciamentoComponent, canActivate: [AuthGuard], children: [
    { path: "homepage", component: HomepageComponent, canActivate: [AuthGuard] },
    { path: "menu", component: MenuComponent },

    { path: "submenu/:id/:cor", loadChildren: "./sub-menu/sub-menu.module#SubMenuModule" }, 
    { path: "atividade/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:idProximaQuestao/:tituloMenu", loadChildren: "./atividade/atividade.module#AtividadeModule"},
    { path: "municipio/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:tituloMenu", loadChildren: "./municipio/municipio.module#MunicipioModule"},
    { path: "questionario/:menuId/:menuName/:etapa/:questionarioId/:nomeQuestionario/:questoes/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:tituloMenu", loadChildren: "./questionario/questionario.module#QuestionarioModule"},
    { path: "licenca/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:tituloMenu", loadChildren: "./licenca/licenca.module#LicencaModule"}, 
    { path: "mindmapResultado/:menuId/:menuIdMindMap/:menuName/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:idProximaQuestao/:etapa/:questionarioId/:nomeQuestionario/:questoes/:instrumentoMindMap/:tituloMenu", component: MindmapResultadoComponent}, 
    { path: "resultado/:resultadoMobile/:menuName/:etapa", loadChildren: "./resultado/resultado.module#ResultadoModule"},
    { path: "calendario/:mes", loadChildren: "./calendario/calendario.module#CalendarioModule"},
    { path: "agendar", loadChildren: "./agendamento/agendamento.module#AgendamentoModule" }
  ]
}];

export const LicenciamentoRouting: ModuleWithProviders = RouterModule.forChild(licenciamentoRoutes);

/*
normal

    { path: "submenu/:id/:cor", loadChildren: () => require("./sub-menu/sub-menu.module")["SubMenuModule"] }, 
    { path: "atividade/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:idProximaQuestao/:tituloMenu", loadChildren: () => require("./atividade/atividade.module")["AtividadeModule"]},
    { path: "municipio/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:tituloMenu", loadChildren: () => require("./municipio/municipio.module")["MunicipioModule"]},
    { path: "questionario/:menuId/:menuName/:etapa/:questionarioId/:nomeQuestionario/:questoes/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:tituloMenu", loadChildren: () => require("./questionario/questionario.module")["QuestionarioModule"]},
    { path: "licenca/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:tituloMenu", loadChildren: () => require("./licenca/licenca.module")["LicencaModule"]}, 
    { path: "mindmapResultado/:menuId/:menuIdMindMap/:menuName/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:idProximaQuestao/:etapa/:questionarioId/:nomeQuestionario/:questoes/:instrumentoMindMap/:tituloMenu", component: MindmapResultadoComponent}, 
    { path: "resultado/:resultadoMobile/:menuName/:etapa", loadChildren: () => require("./resultado/resultado.module")["ResultadoModule"]},
    { path: "calendario/:mes", loadChildren: () => require ("./calendario/calendario.module")["CalendarioModule"]},
    { path: "agendar", loadChildren: () => require ("./agendamento/agendamento.module")["AgendamentoModule"]}



  webpack
    { path: "submenu/:id/:cor", loadChildren: "./sub-menu/sub-menu.module#SubMenuModule" }, 
    { path: "atividade/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:idProximaQuestao/:tituloMenu", loadChildren: "./atividade/atividade.module#AtividadeModule"},
    { path: "municipio/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:tituloMenu", loadChildren: "./municipio/municipio.module#MunicipioModule"},
    { path: "questionario/:menuId/:menuName/:etapa/:questionarioId/:nomeQuestionario/:questoes/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:tituloMenu", loadChildren: "./questionario/questionario.module#QuestionarioModule"},
    { path: "licenca/:menuId/:menuName/:atividadesSelecionadas/:cor/:breadcrumbIndex/:itensEdicao/:tituloMenu", loadChildren: "./licenca/licenca.module#LicencaModule"}, 
    { path: "mindmapResultado/:menuId/:menuIdMindMap/:menuName/:cor/:breadcrumbIndex/:itensEdicao/:mindMap/:idProximaQuestao/:etapa/:questionarioId/:nomeQuestionario/:questoes/:instrumentoMindMap/:tituloMenu", component: MindmapResultadoComponent}, 
    { path: "resultado/:resultadoMobile/:menuName/:etapa", loadChildren: "./resultado/resultado.module#ResultadoModule"},
    { path: "calendario/:mes", loadChildren: "./calendario/calendario.module#CalendarioModule"},
    { path: "agendar", loadChildren: "./agendamento/agendamento.module#AgendamentoModule" }
    */