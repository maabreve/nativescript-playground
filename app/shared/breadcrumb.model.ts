import { SelecaoEntidades, AtividadesSelecionadas } from './respostas.model';

export class Breadcrumb {
    constructor (
        public index: number,
        public etapa: string,
        public etapaTexto: string,
        public menuId: number,
        public menuIdMindMap: number,
        public menuName: string,
        public atividadesSelecionadas: Array<AtividadesSelecionadas>,
        public questionarioId: number,
        public questionarioNome: string,
        public questoes: Array<any>,
        public resultadosMobile: string,
        public colorView: string,
        public respostas: Array<SelecaoEntidades>,
        public respostasTexto: string,
        public active: boolean,
        public mindMap: boolean,
        public idProximaQuestao: number,
        public instrumentoMindMap: string,
        public tituloMenu: string,
        public current: boolean
    ) {}
}