import { Component } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

@Component({
  selector: 'modal-content',
  styles: [`
    .modal-dialog {
      margin: 20;
    }
    .modal-title, .modal-title2 {
      text-transform: uppercase;
      font-size: 16;
    }
    .modal-title2 {
      padding-bottom: 8;
      border-bottom-style: solid;
      border-bottom-width: 1;
      margin-bottom: 8;
    }
    .blue {
      color: #50c8ca;
      border-bottom-color: #50c8ca;
    }
    .red {
      color: #ba3035;
      border-bottom-color: #ba3035;
    }
    .modal-msg {
      font-size: 14;
      margin-bottom: 14;
    }
    .modal-btn-cancel {
      color: #666666;
      border-color: #666666;
      border-style: solid;
      border-width: 1;
      background-color: #FFF;
      height: 40;
    }
    .modal-btn-ok {
      color: #FFF;
      background-color: #50c8ca;
      padding: 18 22 18 22;
    }
    .modal-btn-remover {
      color: #FFF;
      background-color: #ba3035;
      padding: 18 22 18 22;
    }
    `],
  template: `
    <StackLayout class="modal-dialog">
      <Label [class]="titleClass1" [text]="title1" *ngIf="title1 != null"></Label>
      <Label [class]="titleClass2" [text]="title2" *ngIf="titleBold == null"></Label>
      <Label [class]="titleClass2" textWrap="true" row="0" col="0" *ngIf="titleBold != null">
        <FormattedString>
          <Span [text]="title2"></Span>
          <Span [text]="titleBold" fontAttributes="Bold"></Span>
        </FormattedString>
      </Label>
      <Label class="modal-msg" [text]="text" *ngIf="textBold == null" textWrap="true" row="0" col="0"></Label>
      <Label class="modal-msg" *ngIf="textBold != null" textWrap="true" row="0" col="0">
        <FormattedString>
          <Span [text]="text"></Span>
          <Span [text]="textBold" fontAttributes="Bold"></Span>
        </FormattedString>
      </Label>
      <GridLayout class="modal-btn-area" columns="auto,*,auto" rows="auto">
        <Button class="modal-btn-cancel" row="0" col="0" [text]="btnEsq" (tap)="close('Cancel')" *ngIf="btnEsq != null"></Button>
        <Button class="modal-btn-ok" *ngIf="!btnRemover" row="0" col="2" [text]="btnDir" (tap)="close('OK')"></Button>
        <Button class="icon modal-btn-remover" *ngIf="btnRemover" row="0" col="2" text="&#xe904; Remover" (tap)="close('OK')"></Button>
      </GridLayout>
    </StackLayout>
  `
})
export class DialogContent {
  public title1: string;
  public title2: string;
  public titleBold: string;
  public titleClass1: string;
  public titleClass2: string;
  public text: string;
  public textBold: string;
  public btnDir: string;
  public btnEsq: string;
  public btnRemover: boolean;

  constructor(private params: ModalDialogParams) {
    this.titleClass1 = 'modal-title red';
    this.titleClass2 = 'modal-title2 red';
    this.btnDir = 'OK';
    switch (params.context.type) {
      case 'login-incorreto':
        this.title1 = 'Seu login ou senha estão';
        this.title2 = 'incorretos';
        this.text = 'Confirme os dados inseridos e tente novamente.';
        break;
      case 'erro-inesperado':
        this.title2 = 'Inea';
        this.text = 'Ops, ocorreu um erro inesperado.';break;
      case 'email-invalido':
        this.title2 = 'Email inválido.';
        this.text = 'Por favor digite um email válido.';
        break;
      case 'sem-conexao':
        this.title2 = 'Sem conexão com internet';
        this.text = 'É necessário uma conexão com internet para fazer o login.';
        break;
      case 'erro-servidor':
        this.title1 = 'Ops, não foi possivel acessar';
        this.title2 = 'sua conta';
        this.text = 'Aguarde mais alguns minutos ou entre em contato com o administrador do sistema.';
        break;
      case 'erro-servidor-cadastro':
        this.title1 = 'Ops, não foi possivel criar sua';
        this.title2 = 'conta';
        this.text = 'Aguarde mais alguns minutos ou entre em contato com o administrador do sistema.';
        break;
      case 'erro-servidor-recuperar-senha':
        this.title1 = 'Ops, não foi possivel recuperar';
        this.title2 = 'sua senha';
        this.text = 'Aguarde mais alguns minutos ou entre em contato com o administrador do sistema.';
        break;
      case 'erro-facebook':
        this.title1 = 'Ocorreu algum erro ao fazer o';
        this.title2 = 'login pelo facebook';
        this.text = 'Houve algum erro ao tentar se fazer o login com o Facebook. Por favor tente novamente ou escolha outra forma para logar.';
        break;
      case 'erro-google':
        this.title1 = 'Ocorreu algum erro ao fazer o';
        this.title2 = 'login pelo google';
        this.text = 'Houve algum erro ao tentar se fazer o login com o Google. Por favor tente novamente ou escolha outra forma para logar.';
        break;
      case 'sem-conexao-cadastro':
        this.title2 = 'Sem conexão com internet';
        this.text = 'É necesssrio uma conexão com internet para fazer o cadastro.';
        break;
      case 'sem-nome':
        this.title2 = 'Nome inválido';
        this.text = 'Por favor digite seu nome completo.';
        break;
      case 'cpf-invalido':
        this.title2 = 'CPF/CNPJ inválido';
        this.text = 'Por favor digite seu CPF ou CNPJ.';
        break;
      case 'email-nao-confere':
        this.title2 = 'E-mail não confere.';
        this.text = 'O endereço de email deve ser igual nos dois campos.';
        break;
      case 'senha-pequena':
        this.title2 = 'Sua senha é muito curta';
        this.text = 'A senha precisa ter pelo menos 6 caracteres.';
        break;
      case 'senha-nao-confere':
        this.title2 = 'Senha não confere';
        this.text = 'A senha precisa ser igaul nos dois campos.';
        break;
      case 'email-nao-encontrado':
        this.title2 = 'E-mail não encontrado';
        this.text = 'Seu email não foi encontrado em nosso sistema.';
        break;
      case 'senha-recuperada':
        this.title2 = 'Verifique seu e-mail';
        this.text = 'Sua senha foi enviada para seu email.';
        this.titleClass2 = 'modal-title2 blue';
        break;
      case 'ola-nome':
        this.title2 = 'Olá ';
        this.titleBold = params.context.nome;
        this.text = 'Seja muito bem vindo ao seu ambiente de licenciamento ambiental';
        this.btnDir = 'Vamos começar';
        this.titleClass2 = 'modal-title2 blue';
        break;
      case 'menu-nao-carregado':
        this.title2 = 'Inea Menu';
        this.text = 'Lista de menus não carregada.';
        break;
      case 'parametros-incorretos':
        this.title2 = 'Parametros incorretos';
        this.text = 'Há um erro com os parametros.';
        break;
      case 'erro-localizacao':
        this.title2 = 'Localização';
        this.text = 'Não foi possível determniar sua localização.';
        break;
      case 'submenu-nao-cadastrado':
        this.title2 = 'Inea';
        this.text = 'Nenhum sub-menu cadastrado.';
        break;
      case 'erro-inicializacao':
        this.title2 = 'Inicialização do aplicativo';
        this.text = params.context.msg;
        break;
      case 'inea-municipios':
        this.title2 = 'Inea Municípios';
        this.text = params.context.msg;
        break;
      case 'inea-atividades':
        this.title2 = 'Inea Atividades';
        this.text = 'Lista de atividades não carregada.';
        break;
      case 'inea-atividades-cadastradas':
        this.title2 = 'Inea Atividades';
        this.text = 'Nenhuma atividade cadastrada.';
        break;
      case 'inea-agendamento':
        this.title1 = 'O agendamento foi criado com';
        this.title2 = 'sucesso';
        this.text = 'Data do agendamento: ';
        this.textBold = params.context.msg;
        this.titleClass1 = 'modal-title blue';
        this.titleClass2 = 'modal-title2 blue';
        this.btnDir = 'Meus agendamentos';
        this.btnEsq = 'Fechar';
        break;
      case 'inea-agendamento-erro':
        this.title2 = 'Inea Agendamento';
        this.text = params.context.msg;
        break;
      case 'inea-localizacao-erro':
        this.title2 = 'Inea Localzação';
        this.text = params.context.msg;
        break;
      case 'inea-parametros':
        this.title2 = 'Inea Parametros';
        this.text = params.context.msg;
        break;
      case 'inea-erro':
        this.title2 = 'Inea';
        this.text = params.context.msg;
        break;
      case 'confirm-remover':
        this.title1 = 'Tem certeza que deseja remover';
        this.title2 = 'esse item?';
        this.text = params.context.msg;
        this.titleClass1 = 'modal-title blue';
        this.titleClass2 = 'modal-title2 blue';
        this.btnEsq = 'Fechar';
        this.btnRemover = true;
        break;
      default:
        this.title2 = 'Ocorreu um erro';
        this.text = 'Ocorreu algum erro com o sistema, entre em contato com o administrador.';
        break;
    }
  }

  public close(result: string) {
      this.params.closeCallback(result);
  }
}
