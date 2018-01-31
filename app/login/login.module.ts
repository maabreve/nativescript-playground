import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { loginRouting } from './login.routing';
import { LoginComponent } from './login.component';
import { EsqueciSenhaComponent } from './esqueci-senha/esqueci-senha.component';
import { CriarContaComponent } from './criar-conta/criar-conta.component';
import { SocialLoginService } from '../shared/social-login.service';

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    loginRouting
  ],
  declarations: [
    LoginComponent,
    EsqueciSenhaComponent,
    CriarContaComponent,
  ],
  providers: [SocialLoginService],
  schemas: [NO_ERRORS_SCHEMA]
})
export class LoginModule { }
