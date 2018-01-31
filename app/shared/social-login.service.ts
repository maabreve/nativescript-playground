import { Injectable } from '@angular/core';

export interface LoginResult {
  code?: string | number;
  error?: string;
  id?: string;
  userToken?: string;
  displayName?: string;
  photo?: string;
  authToken?: string;
  authCode?: string;
  provider?: string;
}

@Injectable()
export class SocialLoginService {
  private loginResult: LoginResult;

  constructor() {
    this.loginResult = {};
  }

  getResult(): LoginResult {
    return this.loginResult;
  }

  setResult(res: LoginResult) {
    this.loginResult = res;
  }

}
