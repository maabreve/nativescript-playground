import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef, NgZone } from '@angular/core';
import * as SocialLogin from 'nativescript-social-login';
import { ILoginResult } from 'nativescript-social-login';
import { Router } from '@angular/router';
import { Color } from 'color';
import { TouchGestureEventData } from "ui/gestures";
import { connectionType, getConnectionType } from 'connectivity';
import { Animation } from 'ui/animation';
import { View } from 'ui/core/view';
import { screen } from 'platform';
import { prompt } from 'ui/dialogs';
import { Page } from 'ui/page';
import { TextField } from 'ui/text-field';
import { ModalDialogService, ModalDialogOptions, ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { alert, LoginService, User, BackendService, SocialLoginService } from '../shared';
import { DialogContent } from '../dialog/dialog-content';

@Component({
  selector: 'gr-login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login-common.css', './login.component.css'],
})
export class LoginComponent implements OnInit {
  user: User;
  isLoggingIn = true;
  isLoading: boolean = false;
  screenH: number;
  screenW: number;
  isAuthenticating = false;
  colorButtonAcessar:string = '#f5f5f5';
  colorButtonLoginFacebook:string = '#f5f5f5';
  colorButtonLoginGoogle:string = '#f5f5f5';
  colorButtonCadastrar:string = '#16b4b8';
  colorButtonLogin:string = '#666666';
  colorButtonForgotPassword:string = '#666666';

  @ViewChild('initialContainer') initialContainer: ElementRef;
  @ViewChild('mainContainer') mainContainer: ElementRef;
  @ViewChild('signUpStack') signUpStack: ElementRef;
  @ViewChild('password') password: ElementRef;

  constructor(private router: Router,
              private zone:NgZone,
              private loginService: LoginService,
              private socialLoginService: SocialLoginService,
              private modalService: ModalDialogService,
              private viewContainerRef: ViewContainerRef,
              private page: Page) {
    this.user = new User();
  }

  ngOnInit() {
    this.page.actionBarHidden = true;
    this.socialLoginService.setResult({});
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
    // this.user.email = 'raphael@visionnaire.com.br';
    // this.user.password = '123456';
  }

  focusPassword() {
    this.password.nativeElement.focus();
  }

  login() {
    if (!this.isAuthenticating) {
      if (!this.user.isValidEmail()) {
        this.showModal('email-invalido');
        return;
      }
      if (getConnectionType() === connectionType.none) {
        this.showModal('sem-conexao');
        return;
      }

      this.isAuthenticating = true;
      this.isLoading = true;
      this.loginService.login(this.user)
        .subscribe(
          (resp) => {
            this.isAuthenticating = false;
            this.isLoading = false;
            if(resp && resp.token != '') {
              BackendService.token = resp.token;
              BackendService.email = this.user.email;
              this.router.navigate(['/']);
            } else {
              this.showModal('login-incorreto');
            }
          },
          (error) => {
            console.log(error);
            this.isAuthenticating = false;
            this.isLoading = false;
            this.showModal('erro-servidor');
          }
        );
    }
  }

  verifySocialLogin() {
    if (this.socialLoginService.getResult().userToken) {
      this.isAuthenticating = true;
      this.isLoading = true;
      this.loginService.verifySocialLogin(this.socialLoginService.getResult().userToken)
        .subscribe(
          (resp) => {
            if(resp && resp.token != '') {
              BackendService.token = resp.token;
              BackendService.email = this.socialLoginService.getResult().userToken;
              this.socialLoginService.setResult({});
              this.zone.run(() => this.router.navigate(['/']));
            } else {
              // o zone é usado por conta de um bug no router do angular onde ele
              // nao chama o onInit na rota chamada
              // NAO REMOVA O ZONE
              this.zone.run(() => this.router.navigate(['criar-conta']));
            }
            this.isAuthenticating = false;
            this.isLoading = false;
          },
          (error) => {
            console.log(error);
            this.isAuthenticating = false;
            this.isLoading = false;
            this.showModal('erro-servidor');
          }
        );
    } else {
      // alert('Houve algum erro de sistema!');
      this.showModal('erro-servidor');
    }

  }

  loginFacebook() {
    if (!this.isAuthenticating) {
      console.log('logando com facebook');
      this.isAuthenticating = true;
      this.isLoading = true;

      // this.socialLoginService.setResult({
      //   code: '0',
      //   error: undefined,
      //   id: '1235631639869587',
      //   userToken: 'raphael@visionnaire.com.br',
      //   displayName: 'Raphael Ratuczne',
      //   photo: 'https://scontent.xx.fbcdn.net/v/t1.0-1/s200x200/1975215_680294048736685_5882273373079136066_n.jpg?oh=0dc5ad2f27fcd61ebda1e032940cafad&oe=598D9EC7',
      //   authToken: 'EAAKBJTnEDuoBAK3UgEzqZAvV7a50K2rVfjclEfxwUVtIG6YWTHs9EM95UU6jqV90Py9kFGe5TknSLB1wpIiGI1pVxnHepcBx3RvbdNjDgYqr4ttidgfZAPKWqXDX0yYyeYnxoISndZAD37VoarMoHMwMSTDtI4UPfArzen5VjPkV9qZA2BMKIsOHJPRZBIkNL7EGq7R3OGKReh1IoYcmF',
      //   provider: 'facebook'
      // });
      // setTimeout(() => {
      //   this.verifySocialLogin();
      // }, 1000);

      SocialLogin.loginWithFacebook((result) => {
        console.log('resultado facebook >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        // console.log('code: ' + result.code); // 0
        // console.log('error: ' + result.error); // undefined
        console.log('id: ' + result.id); // 1235631639869587
        console.log('userToken: ' + result.userToken); // metalraziel@gmail.com
        // console.log('displayName: ' + result.displayName); // Raphael Ratuczne
        // console.log('photo: ' + result.photo); // https://scontent.xx.fbcdn.net/v/t1.0-1/s200x200/1975215_680294048736685_5882273373079136066_n.jpg?oh=0dc5ad2f27fcd61ebda1e032940cafad&oe=598D9EC7
        // console.log('authToken: ' + result.authToken); // EAAKBJTnEDuoBAK3UgEzqZAvV7a50K2rVfjclEfxwUVtIG6YWTHs9EM95UU6jqV90Py9kFGe5TknSLB1wpIiGI1pVxnHepcBx3RvbdNjDgYqr4ttidgfZAPKWqXDX0yYyeYnxoISndZAD37VoarMoHMwMSTDtI4UPfArzen5VjPkV9qZA2BMKIsOHJPRZBIkNL7EGq7R3OGKReh1IoYcmF
        // console.log('provider:' + result.provider); // facebook

        this.socialLoginService.setResult({
          id: result.id,
          userToken: result.userToken
        });
        if (result.userToken) {
          // apos recebr a confirmacao do facebook, verifica se o user existe no servidor
          this.verifySocialLogin();
        } else {
          this.showModal('erro-facebook');
          this.isAuthenticating = false;
          this.isLoading = false;
          // alert('Houve algum erro ao tentar logar com sua conta do Facebook!');
        }
        // setTimeout(()=>{
        // },100);
      });
    }
  }

  loginGoogle() {
    if (!this.isAuthenticating) {
      console.log('logando com google');
      this.isAuthenticating = true;
      this.isLoading = true;

      // this.socialLoginService.setResult({
      //   code: '0',
      //   error: undefined,
      //   id: '115075310775048731044',
      //   userToken: 'raphael@visionnaire.com.br',
      //   displayName: 'Raphael Ratuczne',
      //   photo: 'https://lh5.googleusercontent.com/-O83073U5KqQ/AAAAAAAAAAI/AAAAAAAAHRE/5XQJOQXk6YE/photo.jpg',
      //   authToken: null,
      //   authCode: null,
      //   provider: 'google'
      // });
      // setTimeout(() => {
      //   this.verifySocialLogin();
      // }, 1000);

      SocialLogin.loginWithGoogle((result) => {
        console.log('resultado google >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        // console.log('code: ' + result.code); // 0
        // console.log('error: ' + result.error); // undefined
        console.log('RESULT ', JSON.stringify(result));
        console.log('id: ' + result.id); // 115075310775048731044
        console.log('userToken: ' + result.userToken); // metalraziel@gmail.com
        // console.log('displayName: ' + result.displayName); // Raphael Ratuczne
        // console.log('photo: ' + result.photo); // https://lh5.googleusercontent.com/-O83073U5KqQ/AAAAAAAAAAI/AAAAAAAAHRE/5XQJOQXk6YE/photo.jpg
        // console.log('authToken: ' + result.authToken); // null
        // console.log('provider:' + result.provider); // google
        // console.log('authCode:' + result.authCode); // null

        this.socialLoginService.setResult({
          id: result.id,
          userToken: result.userToken
        });
        if (result.userToken) {
          // apos recebr a confirmacao do google, verifica se o user existe no servidor
          this.verifySocialLogin();
        } else {
          this.showModal('erro-google');
          this.isAuthenticating = false;
          this.isLoading = false;
          // alert('Houve algum erro ao tentar logar com sua conta do Google!');
        }
        // setTimeout(()=>{
        // },100);
      });
    }
  }


  signUp() {
    if (!this.isAuthenticating)
      this.router.navigate(['criar-conta']);
  }

  forgotPassword() {
    if (!this.isAuthenticating)
      this.router.navigate(['esqueci-senha']);
  }

  toggleDisplay() {
    this.isLoggingIn = !this.isLoggingIn;
    let mainContainer = <View>this.mainContainer.nativeElement;
    mainContainer.animate({
      backgroundColor: this.isLoggingIn ? new Color('white') : new Color('#301217'),
      duration: 200
    });
  }

  showMainContent() {
    let initialContainer = <View>this.initialContainer.nativeElement;
    let mainContainer = <View>this.mainContainer.nativeElement;
    let animations = [];

    // Fade out the initial content over one half second
    initialContainer.animate({
      opacity: 0,
      duration: 500
    }).then(function() {
      // After the animation completes, hide the initial container and
      // show the main container and logo. The main container and logo will
      // not immediately appear because their opacity is set to 0 in CSS.
      initialContainer.style.visibility = 'collapse';
      mainContainer.style.visibility = 'visible';

      // Fade in the main container and logo over one half second.
      animations.push({ target: mainContainer, opacity: 1, duration: 500 });


      // Kick off the animation queue
      new Animation(animations, false).play();
    });
  }

  onForgotPasswordTouch(args: TouchGestureEventData) {
    if (!this.isAuthenticating) {
      if (args.action === 'down') {
        this.colorButtonForgotPassword = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        this.colorButtonForgotPassword = '#666666';
      }
    }
  }

  onLoginTouch(args: TouchGestureEventData) {
    if (!this.isAuthenticating) {
      if (args.action === 'down') {
        this.colorButtonLogin = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        this.colorButtonLogin = '#666666';
      }
    }
  }

  onMainContentTouch(args: TouchGestureEventData) {
    if (!this.isAuthenticating) {
      if (args.action === 'down') {
        this.colorButtonAcessar = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        this.colorButtonAcessar = '#f5f5f5';
      }
    }
  }

  onSignUpTouch(args: TouchGestureEventData) {
    if (!this.isAuthenticating) {
      if (args.action === 'down') {
        this.colorButtonCadastrar = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        this.colorButtonCadastrar = '#16b4b8';
      }
    }
  }

  onLoginFacebookTouch(args: TouchGestureEventData) {
    if (!this.isAuthenticating) {
      if (args.action === 'down') {
        this.colorButtonLoginFacebook = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        this.colorButtonLoginFacebook = '#f5f5f5';
      }
    }
  }

  onLoginGoogleTouch(args: TouchGestureEventData) {
    if (!this.isAuthenticating) {
      if (args.action === 'down') {
        this.colorButtonLoginGoogle = '#C3C3C3';
      } else if (args.action === 'up' || args.action === ' cancel') {
        this.colorButtonLoginGoogle = '#f5f5f5';
      }
    }
  }

  showModal(type:string) {
    let options: ModalDialogOptions = {
      context: { type: type },
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };
    this.modalService.showModal(DialogContent, options)
      // .then((dialogResult: string) => {
      //   if (dialogResult == 'OK') {}
      // });
  }
}
