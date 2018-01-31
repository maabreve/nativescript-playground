export class Municipio {
  
  constructor(public id: number, 
              public nome: string, 
              public selecionado: boolean) {}
}

export class Endereco {
  
  constructor(public id: string, 
              public format_address: string,
              public lat: string,
              public lng: string) {}
}


export class Position {
  
  constructor(public id: number,
              public latitude: number,
              public longitude: number) {}
}