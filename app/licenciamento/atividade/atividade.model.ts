
export class Atividade {
  constructor(public id: number, 
              public nome: string,
              public atividadePaiId: number,
              public selecionado: boolean,
              public botaoAvancar: boolean,
              public possuiQuestionario: boolean,
              public ordem: number) {}
}


export class AtividadeRecursiva {
  constructor(public id: number,
              public nome: string,
              public atividadePaiId: number,
              public selecionado: boolean,
              public botaoAvancar: boolean,
              public possuiQuestionario: boolean,
              public ordem: number,
              public atividades: [Atividade]) {}
}