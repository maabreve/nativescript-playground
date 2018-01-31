import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from 'ui/page';
import { screen } from 'platform';
// import { View } from 'ui/core/view';
// import { Color } from "color";
import { TouchGestureEventData } from 'ui/gestures';
import { TextField } from 'ui/text-field';
import { ModalDialogService, ModalDialogOptions, ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { LoginService, User, BackendService } from '../../shared';
import { DialogContent } from '../../dialog/dialog-content';

@Component({
  selector: 'esqueci-senha',
  moduleId: module.id,
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.css']
})

export class EsqueciSenhaComponent implements OnInit {
  user: User;
  confirmEmail: string;
  isAuthenticating = false;
  isLoading: boolean = false;
  screenH: number;
  screenW: number;

  constructor(private router: Router,
              private loginService: LoginService,
              private modalService: ModalDialogService,
              private viewContainerRef: ViewContainerRef,
              private page: Page) {
  }

  ngOnInit() {
    this.page.actionBarHidden = true;
    this.user = new User();
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
    // this.user.email = 'raphael@visionnaire.com.br';
    // this.confirmEmail = 'raphael@visionnaire.com.br';
  }

  submit() {
    if (!this.isAuthenticating) {

      if ( !this.user.email || !this.user.isValidEmail() ) {
        this.showModal('email-invalido');
        return;
      }
      if (this.user.email != this.confirmEmail) {
        this.showModal('email-nao-confere');
        return;
      }
      this.isAuthenticating = true;
      this.isLoading = true;
      this.loginService.resetPassword(this.user)
        .subscribe(
          (res) => {
            this.isAuthenticating = false;
            this.isLoading = false;
            if (res) {
              this.showModal('senha-recuperada', () => this.router.navigate(['/']));
            } else {
              this.showModal('email-nao-encontrado', () => this.router.navigate(['criar-conta']));
            }
          },
          (error) => {
            console.log('error: ', error);
            this.showModal('erro-servidor-recuperar-senha')
            this.isAuthenticating = false;
            this.isLoading = false;
          }
        );
    }
  }

  back() {
    if (!this.isAuthenticating)
      this.router.navigate(['login']);
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

  showModal(type:string, fn:Function = null) {
    let options: ModalDialogOptions = {
      context: { type: type },
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };
    this.modalService.showModal(DialogContent, options)
      .then((dialogResult: string) => {
        if (typeof(fn) == 'function') {
          fn();
        }
      });
  }
}
