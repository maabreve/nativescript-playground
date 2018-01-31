import { Injectable, OnInit } from "@angular/core";
import { Http, Headers, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { getString } from "application-settings";
import { Config } from "./config";
import { connectionType, getConnectionType } from "connectivity";
import * as appSettings from "application-settings";

import { Menu } from "../licenciamento/menu/menu.model";
import { MenuRecursivo } from "../licenciamento/menu/menu.model";
import { Atividade } from "../licenciamento/atividade/atividade.model";
import { AtividadeRecursiva } from "../licenciamento/atividade/atividade.model";
import { Municipio } from "../licenciamento/municipio/municipio.model";
import { TipoLicenca } from "../licenciamento/licenca/licenca.model";
import { AgendamentoMes, AgendamentoUsuario } from "../licenciamento/agendamento/agendamento.model";
import { Versoes } from "./versoes.model";
import { RespostasRetorno } from "./respostas.model";

@Injectable()
export class IneaService implements OnInit {

    token: string;

    constructor(private http: Http) {

    }

    ngOnInit() {
        this.token = getString("token");
    }

    public obterVersoes() {

        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));
        console.log('Config.apiUrlObterVersoes ', Config.apiUrlObterVersoes);
        return this.http.get(Config.apiUrlObterVersoes, { headers: headers })
            .map(resVersoes => resVersoes.json())
            .map(versoesData => {
                return versoesData;
            })
            .catch(this.handleErrors);
    }

    public criarProcesso() {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));

        let params: URLSearchParams = new URLSearchParams();
        params.set("email", getString("email"));
        // console.log(getString("email"));

        // console.log("***************************************************************");
        // console.log("URL ", Config.apiUrlCriarProcesso);

        return <Observable<any>>this.http.get(Config.apiUrlCriarProcesso, {
            headers: headers,
            search: params
        })
            .map(resProcesso => resProcesso.json())
            .map(processoData => {
                // console.log("processo criado!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                return processoData.id;

        })
        .catch(this.handleErrors) ;
    }

    public obterTiposLicenca() {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));

        return <Observable<Array<TipoLicenca>>> this.http.get(Config.apiUrlObterTipoLicencas, {
            headers: headers
        })
            .map(resLicencas => resLicencas.json())
            .map(versoesLicencas => {
                return versoesLicencas;
            })
            .catch(this.handleErrors);
    }

    public obterMenu() {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));
        // console.log("*************************************************************** ");
        // console.log("VAI CHAMAR MENU ", new Date());
        return <Observable<Array<Menu>>>this.http.get(Config.apiUrlMenu, {
            headers: headers
        })
            .map(resMenu => resMenu.json())
            .map(menuData => {
                // console.log("RETORNOU MENU ", new Date());

                return menuData;
            })
            .catch(this.handleErrors);
    }

     public obterDocumentoMenu(qciId: string, email: string) {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));
        let params: URLSearchParams = new URLSearchParams();
        params.set("qciId", qciId);
        params.set("email", email);

        return <Observable<Array<any>>>this.http.get(Config.apiUrlObterDocumentoMenu, {
            headers: headers,
            search: params
        })
            .map(resMenu => resMenu.json())
            .map(menuData => {
                return menuData;
            })
            .catch(this.handleErrors);
    }

    public obterAtividades() {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));

        // console.log("*************************************************************** ");
        // console.log("VAI CHAMAR ATIVIDADES ", new Date());

        return <Observable<Array<Atividade>>>this.http.get(Config.apiUrlAtividade, {
            headers: headers
        })
            .map(resAtividades => resAtividades.json())
            .map(atividadesData => {

                // console.log("RETORNOU ATIVIDADES ", new Date());

                return atividadesData;
            })
            .catch(this.handleErrors);
    }

    public obterMunicipios() {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));

        // console.log("*************************************************************** ");
        // console.log("VAI CHAMAR MUNICIPIOS ", new Date());

        return <Observable<Array<Municipio>>>this.http.get(Config.apiUrlMunicipio, {
            headers: headers
        })
            .map(resMunicipios => resMunicipios.json())
            .map(municipioData => {

        // console.log("RETORNOU MUNICIPIOS ", new Date());

                return municipioData;
            })
            .catch(this.handleErrors);
    }

    public gravarRespostas(respostaJson):  Observable<RespostasRetorno>  {
        let body = `respostaJson=${respostaJson}`;
        let headers = new Headers();

        headers.append("Content-Type", "application/x-www-form-urlencoded");
        return <Observable<RespostasRetorno>> this.http
            .post(Config.apiUrlGravarRespostas, body, { headers: headers })
            .map(response => response.json())
            .map(response => {
                return response;
            })
            .catch (this.handleErrors);
    }

    public obterAgendamentoMes(ano, mes) {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + getString("token"));

        let params: URLSearchParams = new URLSearchParams();
        params.set("ano", ano);
        params.set("mes", mes);

        return <Observable<Array<AgendamentoMes>>> this.http.get(Config.apiUrlAgendaLivre, {
            headers: headers,
            search: params
        })
        .map(resAgenda => resAgenda.json())
        .map(resAgenda => {
            return resAgenda;
        })
        .catch(this.handleErrors) ;
    }

    public obterAgendamentosUsuario(email: string) {
      let headers = new Headers();
      headers.append("Authorization", "Bearer " + getString("token"));

      let params: URLSearchParams = new URLSearchParams();
      params.set("email", email);
      return <Observable<Array<AgendamentoUsuario>>> this.http.get(Config.apiUrlObterAgendamentoUsuario, {
        headers: headers,
        search: params
      })
        .map(res => res.json())
        .map(data => {
          return data;
        })
        .catch(this.handleErrors) ;
    }

    public deletarAgendamentosUsuario(id: string) {
      let headers = new Headers();
      headers.append("Authorization", "Bearer " + getString("token"));

      let params: URLSearchParams = new URLSearchParams();
      params.set("id", id);
      return this.http.get(Config.apiUrlDeletarAgendamentoUsuario, {
        headers: headers,
        search: params
      })
        // .map(res => res.json())
        .map(data => {
          return data;
        })
        .catch(this.handleErrors);
    }

    public gravarAgenda(telefone, email, objetivoConsulta, data) {
        let body = `telefone=${telefone}&email=${email}&objetivoConsulta=${objetivoConsulta}&data=${data}`;
        let headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        return this.http
            .post(Config.apiUrlAddEventoAgendaLivre, body, { headers: headers })
            .map(response => {
                return response;
            })
            .catch(this.handleErrors);;
    }

    public handleErrors(error: Response) {
        console.log("Erro: Inea Service: ", error);
        return Observable.throw(error);
    }

}
