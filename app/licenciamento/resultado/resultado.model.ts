export class ResultadoMenu {
  constructor(public etapa: string, 
              public resultadosMobile: Array<ResultadoMobile>) {
  }
}

export class AtividadeMenu {
  constructor(public nome: string) {
  }
}

export class EnderecoMenu {
  constructor(public nome: string) {
  }
}

export class ResultadoMobile {
  constructor(public tipoLicenca: string,
              public atividades: Array<AtividadeMenu>,
              public enderecos:Array<EnderecoMenu>) {
  }
}