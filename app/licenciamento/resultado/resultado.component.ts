import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { RouterExtensions } from 'nativescript-angular/router';
import { isAndroid, isIOS, device, screen } from "platform";
import { Page } from 'ui/page';
var appSettings = require('application-settings');
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';

import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";
import { ResultadoMenu, ResultadoMobile, AtividadeMenu, EnderecoMenu } from "./resultado.model";
import { DialogContent } from '../../dialog/dialog-content';

@Component({
  moduleId: module.id,
  selector: "IneaResultado",
  templateUrl: "./resultado.component.html",
  styleUrls: ["./resultado.component.css"],
  providers: [IneaService, IneaController]
})

export class ResultadoComponent implements OnInit {

  menuName: string = '';
  licencasListView: Array<ResultadoMobile> = [];
  currentResultado: ResultadoMenu;

  constructor(private ineaService: IneaService,
    private ineaController: IneaController,
    private router: Router,
    private page: Page,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions) { }

  ngOnInit() {
    this.page.actionBar.title = 'RESULTADO';
    this.route.params.subscribe(params => {
      
      if (!params["resultadoMobile"] || typeof(params["resultadoMobile"]) !== 'object' && !params["menuName"]) {
        // alert('Parametros incorretos');
        this.showModal({type:'inea-parametros', msg: 'Parametros incorretos'});
        return;
      }
      

      this.menuName = params["menuName"];
      let resultado= JSON.parse(params["resultadoMobile"]) || [];
      resultado.forEach(r => {

        let atividades: Array<AtividadeMenu> = [];
        let enderecos: Array<EnderecoMenu> = [];

        if (r.atividades !== undefined) {
          r.atividades.forEach(a => {
            atividades.push(new AtividadeMenu(a));
          });

        }

        if (r.atividades !== undefined) {
          r.enderecos.forEach(e => {
            e.endereco.forEach(end => {
              enderecos.push(new EnderecoMenu(end));
              //console.log('ENDERECO ITEM', end);
            });

          });
        }
        let resultadoMobile = new ResultadoMobile(r.tipoLicenca, atividades, enderecos);
        this.licencasListView.push(resultadoMobile);

      });

    });

     if (isAndroid) {
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
          data.cancel = true;
          application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
          let submenuId: string = appSettings.getString('inea-submenu-id');
          this.router.navigate(['licenciamento/true/submenu/' + submenuId + '/' + '#00b4b9']);
        });
      }

  }

  toogleDetails(item) {
    item.toggleDetalhes = !item.toggleDetalhes;
  }

  // mensagens modal
  showModal(obj: Object) {
    let options: ModalDialogOptions = {
      context: obj,
      fullscreen: false,
      viewContainerRef: this.viewContainerRef
    };
    this.modalService.showModal(DialogContent, options);
  }

}
