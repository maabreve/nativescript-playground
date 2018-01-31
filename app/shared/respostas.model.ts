export class SelecaoEntidades {
    constructor(
    public id: number,
    public tipo: string,
    public resposta: string,
    public itemQuestaoId: number,
    public selecionado: boolean
    ) {

    }
}
export class Respostas {
    constructor (
    public processoId: number,
    public menuId: number,
    public etapa: string,
    public voltar: boolean,
    public idProximaQuestao: number,
    public mindMap: boolean,
    public selecaoEntidades: Array<SelecaoEntidades>) {}
}

export class QuestoesItem {
    constructor (
    public nome: string,
    public ponto: number,
    public id: number,
    public selecionado: boolean
    ) {}
}

export class Questoes {
    constructor (
    public nome: string,
    public origemCriterio: string,
    public enquadra: boolean,
    public ordem: number,
    public tipoResposta: string,
    public itemQuestaos: Array<QuestoesItem>,
    public respostaTextoLivre: string,
    public id: number,
    public tituloSaibaMais: string,
    public descricaoSaibaMais: string,
    public urlSaibaMais: string
    ) {}
}

export class Questionario {
  constructor(public questionarioId: number, 
              public nomeQuestionario: string, 
              public questoes: Array<Questoes>) {}
}

export class RespostasRetorno {
    constructor (
    public etapaId: number,
    public questionarioId: number,
    public nomeQuestionario: string,
    public menuId: number,
    public etapa: string,
    public questoes: Array<Questoes>,
    public resultadosMobile: any,
    public mindMap: boolean,
    public idProximaQuestao: number,
    public instrumentoMindMap: string,
    public tituloMenu: string
    ) {}
}

export class AtividadesSelecionadas {
  constructor(public grupo: string, 
              public nome: string) {}
}
