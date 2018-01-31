import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Page } from "ui/page";
import { isAndroid, isIOS, screen } from "platform";
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";

@Component({
    moduleId: module.id,
    selector: "agenda-menu",
    templateUrl: "./agenda-menu.component.html",
    styleUrls: ["./agenda-menu.component.css"],
})

export class AgendaMenuComponent implements OnInit {

  isLoading: boolean = false;
  public colorButtonAgendar: string = "#0f6fb7";
  public colorButtonLista: string = "#92b81f";
  screenH: number;
  screenW: number;

  constructor(private page: Page,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.page.actionBar.title = "AGENDAMENTO";
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
    if (isAndroid) {
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
            data.cancel = true;
            this.router.navigate(["licenciamento/true/homepage"]);
        });
    }
  }

  goToAgendar() {
    this.colorButtonAgendar = "#C3C3C3";
    this.isLoading = true;
    setTimeout(()=>{
      let mes = new Date().getUTCMonth() + 1;
      this.router.navigate(["licenciamento/false/calendario", mes.toString()]);
    },500);
  }

  goToLista() {
    this.colorButtonLista = "#C3C3C3";
    this.isLoading = true;
    setTimeout(()=>{
      this.router.navigate(["licenciamento/false/agendar/listar"]);
    },500);
  }

}
