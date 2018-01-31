import { AtividadesSelecionadas } from './respostas.model';

export class Carrinho {
    constructor (
        public menuIdMindMap: number,
        public menuId:  number,
        public menuName: string,
        public atividadesSelecionadas: Array<AtividadesSelecionadas>,
        public colorView: string,
        public breadcrumbIndex: number,
        public itens: string,
        public mindMap: boolean,
        public idProximaQuestao: number,
        public etapa: string,
        public questionarioId: number,
        public questionarioNome: string,
        public questoes: string,
        public instrumentoMindMap: string,
        public tituloMenu: string
    ) {}
}
