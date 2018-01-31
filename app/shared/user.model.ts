const validator = require("email-validator");

export class User {
  name: string;
  email: string;
  cpf_cnpj: string;
  password: string;
  // phone: string;

  isValidEmail() {
    return validator.validate(this.email);
  }

  isValidCPF() {
    // funcao retirada de http://www.devmedia.com.br/validar-cpf-com-javascript/23916

    if (this.cpf_cnpj == null)
      return false;

    this.cpf_cnpj = this.cpf_cnpj.replace(/[^\d]+/g,'');

    let Soma;
    let Resto;
    Soma = 0;

  	if (this.cpf_cnpj == '00000000000')
      return false;

  	for (let i=1; i<=9; i++)
      Soma = Soma + parseInt( this.cpf_cnpj.substring(i-1, i) ) * (11 - i);

  	Resto = (Soma * 10) % 11;

    if ( (Resto == 10) || (Resto == 11) )
      Resto = 0;

    if (Resto != parseInt( this.cpf_cnpj.substring(9, 10) ) )
      return false;

  	Soma = 0;
    for (let i = 1; i <= 10; i++)
      Soma = Soma + parseInt( this.cpf_cnpj.substring(i-1, i) ) * (12 - i);

    Resto = (Soma * 10) % 11;

    if ( (Resto == 10) || (Resto == 11) )
      Resto = 0;

    if ( Resto != parseInt( this.cpf_cnpj.substring(10, 11) ) )
      return false;

    return true;
  }

  isValidCNPJ() {
    // funcao retirada de http://www.geradorcnpj.com/javascript-validar-cnpj.htm

    if (this.cpf_cnpj == null)
      return false;

    this.cpf_cnpj = this.cpf_cnpj.replace(/[^\d]+/g,'');

    let tamanho;
    let numeros;
    let digitos;
    let soma;
    let pos;
    let resultado;

    if(this.cpf_cnpj == '')
      return false;

    if (this.cpf_cnpj.length != 14)
      return false;

    if (this.cpf_cnpj == '00000000000000')
      return false;

    // Valida DVs
    tamanho = this.cpf_cnpj.length - 2;
    numeros = this.cpf_cnpj.substring(0,tamanho);
    digitos = this.cpf_cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
        pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    if (resultado != digitos.charAt(0))
      return false;

    tamanho = tamanho + 1;
    numeros = this.cpf_cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
      return false;

    return true;
  }
}
