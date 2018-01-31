export class Menu {
  
  constructor(public id: number, 
              public label: string,
              public titulo: string, 
              public etapa: string,
              public cor: string,
              public qciId: string,
              public resultadosMobile: string,
              public ordem: number,
              public questionario: any) {}
}

export class MenuRecursivo {
  
  constructor(public id: number, 
              public label: string,
              public titulo: string,  
              public cor: string,
              public qciId: string,
              public resultadosMobile: string,
              public etapa: string,
              public ordem: number,
              public questionario: any,
              public menus: [Menu]) {}
}