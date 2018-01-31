import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from 'ui/page';
import 'rxjs/add/operator/switchMap';
import { View } from 'ui/core/view';
import { screen } from 'platform';
import { connectionType, getConnectionType } from 'connectivity';
import { TextField } from 'ui/text-field';
import { TouchGestureEventData } from 'ui/gestures';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';

import { alert, LoginService, User, BackendService, SocialLoginService } from '../../shared';
import { DialogContent } from '../../dialog/dialog-content';


@Component({
  selector: 'criar-conta',
  moduleId: module.id,
  templateUrl: './criar-conta.component.html',
  styleUrls: ['./criar-conta.component.css']
})

export class CriarContaComponent implements OnInit {
  user: User;
  isAuthenticating = false;
  isLoading: boolean = false;
  screenH: number;
  screenW: number;
  confirmEmail: string;
  confirmPass: string;
  isSocialLogin: boolean;
  textLabel: string;
  colorButtonBack: string = '';

  constructor(private router: Router,
              private loginService: LoginService,
              private socialLoginService: SocialLoginService,
              private modalService: ModalDialogService,
              private viewContainerRef: ViewContainerRef,
              private page: Page) {}

  ngOnInit() {
    this.page.actionBarHidden = true;
    this.user = new User();
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;

    if (this.socialLoginService.getResult().userToken) {
      this.isSocialLogin = true;
      this.textLabel = 'Complemente seus dados para criar a conta.';
      this.user.email = this.socialLoginService.getResult().userToken;
      this.user.email = this.user.isValidEmail() ? this.user.email : '';

      // this.user.name = 'Raphael';
      // this.user.cpf_cnpj = '04774341932';
    } else {
      console.log('add novo user sem face google');
      this.textLabel = 'Preencha os campos abaixo para criar sua conta.';
      this.isSocialLogin = false;

      // this.user.name = 'Raphael';
      // this.user.email = 'raphael@visionnaire.com.br';
      // this.confirmEmail = this.user.email;
      // this.user.cpf_cnpj = '04774341932';
      // this.user.password = '123456';
      // this.confirmPass = this.user.password;
    }
  }

  back() {
    if (!this.isAuthenticating)
      this.router.navigate(['login']);
  }

  submit() {
    if (!this.isAuthenticating) {

      if (getConnectionType() === connectionType.none) {
        this.showModal('sem-conexao-cadastro');
        return;
      }
      if (!this.user.name || this.user.name.length < 3) {
        this.showModal('sem-nome');
        return;
      }
      if ( !this.user.isValidCPF() && !this.user.isValidCNPJ() ) {
        this.showModal('cpf-invalido');
        return;
      }
      if ( !this.user.email || !this.user.isValidEmail() ) {
        this.showModal('email-invalido');
        return;
      }
      if (this.user.email != this.confirmEmail && !this.isSocialLogin) {
        this.showModal('email-nao-confere');
        return;
      }
      if (!this.isSocialLogin && (!this.user.password || this.user.password.length < 6)) {
        this.showModal('senha-pequena')
        return;
      }
      if (this.user.password != this.confirmPass && !this.isSocialLogin) {
        this.showModal('senha-nao-confere');
        return;
      }
      this.isAuthenticating = true;
      this.isLoading = true;
      this.loginService.register(this.user)
      .subscribe(
        (resp) => {
          if (resp && resp.token != '') {
            // alert('Seu conta foi criada!');
            this.isAuthenticating = false;
            this.isLoading = false;
            BackendService.token = resp.token;
            BackendService.email = this.user.email;
            this.socialLoginService.setResult({});
            this.router.navigate(['/']);
          } else {
            this.showModal('erro-servidor-cadastro');
          }
        },
        (error) => {
          console.log('error: ', error);
          this.showModal('erro-servidor-cadastro');
          this.isAuthenticating = false;
          this.isLoading = false;
        }
      );
    }
  }

  onBackTouch(args: TouchGestureEventData, button) {
    if(!this.isAuthenticating) {
      if (args.action === 'down') {
        button.backgroundColor = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        button.backgroundColor = '#16b4b8';
      }
    }
  }

  onSubmitTouch(args: TouchGestureEventData, button) {
    if(!this.isAuthenticating) {
      if (args.action === 'down') {
        button.backgroundColor = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        setTimeout(() => {
          if(this.isAuthenticating)
            button.backgroundColor = '#97dedf';
          else
            button.backgroundColor = '#16b4b8';
        },100);
      }
    }
  }

  showModal(type:string) {
    let options: ModalDialogOptions = {
      context: { type: type },
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };
    this.modalService.showModal(DialogContent, options);
  }

}
