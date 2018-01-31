import { Injectable } from "@angular/core";
import { getString, setString } from "application-settings";

const tokenKey = "token";

export class BackendService {
  static apiUrl = "https://api.everlive.com/v1/GWfRtXi1Lwt4jcqK/";

  static isLoggedIn(): boolean {
    return !!getString("token");
  }

  static get token(): string {
    return getString("token");
  }

  static set token(theToken: string) {
    setString("token", theToken);
  }

  static get email(): string {
    return getString('email');
  }

  static set email(email: string) {
    setString('email', email);
  }
}
