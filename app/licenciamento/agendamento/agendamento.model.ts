export class AgendamentoMes {
  constructor(public data: string, 
              public diaSemana: string,
              public diaSemanaInt: number,
              public horarios:Array<string>) {}
}

export class AgendamentoUsuario {
  constructor(public id: string, 
              public data: string) {}
}

export class HorariosDisponiveis {
  constructor(public hora: string, 
              public selecionado: boolean) {}
}

