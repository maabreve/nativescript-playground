import { Injectable, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { getString } from 'application-settings';

import { User } from './user.model';
import { BackendService } from './backend.service';
import { Config } from './config';

@Injectable()
export class LoginService implements OnInit {

  token: string;

  constructor(private http: Http) { }

  ngOnInit() {
    this.token = getString('token');
  }

  register(user: User) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let body = `nome=${user.name}&email=${user.email}&senha=${user.password}`;

    if (user.isValidCPF())
      body += `&cpf=${user.cpf_cnpj}`;
    else if (user.isValidCNPJ())
      body += `&cnpj=${user.cpf_cnpj}`;

    return this.http.post(Config.apiUrlCriarUsuario, body, { headers: headers })
        .map(response => response.json())
        .map(response => {
            return response;
        });
  }

  login(user: User) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let body = `login=${user.email}&senha=${user.password}`;

    return this.http
        .post(Config.apiUrlLogin, body, { headers: headers })
        .map(response => response.json())
        .map(response => {
            return response;
        })
        .catch(this.handleErrors);

  }

  verifySocialLogin(email: string) {
    console.log('conecta com o serviço verifySocialLogin', email);
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.get(Config.apiUrlVerificarSocialLogin + '?email='+ email , { headers: headers })
        .map(res => res.json())
        .map(res => {
            return res;
        });
    // return new Observable(observer => {
    //   observer.next('testerere');
    //   observer.complete();
    // });
  }

  logoff() {
    BackendService.token = '';
  }

  resetPassword(user: User) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.get(Config.apiUrlRecuperarSenha + '?email='+ user.email , { headers: headers })
        .map(res => res.json())
        .map(res => {
            return res;
        });
  }

  handleErrors(error: Response) {
    console.log('handleErrors:',error);
    return Observable.throw(error);
  }
}
