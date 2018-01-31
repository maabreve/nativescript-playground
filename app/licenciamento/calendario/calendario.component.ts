import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { RouterExtensions } from 'nativescript-angular/router';
import { TouchGestureEventData } from 'ui/gestures';
import { Page } from 'ui/page';
import { setString } from 'application-settings';
var appSettings = require('application-settings');
import { isAndroid, isIOS, screen } from "platform";
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";

// var dialogs = require("ui/dialogs");

import { IneaService } from "../../shared/inea.service";
import { AgendamentoMes } from "../agendamento/agendamento.model";

@Component({
  moduleId: module.id,
  selector: "IneaAgendamento",
  templateUrl: "./calendario.component.html",
  styleUrls: ["./calendario.component.css"],
  providers: [IneaService],
})

export class CalendarioComponent implements OnInit{
  constructor(private ineaService: IneaService,
    private page: Page,
    private router: Router,
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private changeDetectionRef: ChangeDetectorRef) {
  }

  headerCalendar: string;
  currentMonth: number;
  currentYear: number;
  allowRewind: boolean;
  allowForward: boolean;
  dates: Array<string> = [];
  datesCss: Array<boolean> = [];
  datesOccupied: Array<AgendamentoMes> = [];
  datesOccupiedCache: Array<AgendamentoMes> = [];
  monthsCache: Array<number> = [];
  screenH: number;
  screenW: number;
  isLoading: boolean;

  ngOnInit() {
    setString('selectedMenu', 'Agendamento');
    this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
    this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;

    this.route.params.subscribe(params => {
      this.currentYear = new Date().getUTCFullYear();
      this.currentMonth = new Date().getUTCMonth() + 1;
      this.allowRewind = false;
      this.allowForward = true;
      this.showHeader();
      this.loadCalendar();
      this.loadOccupiedDates();
    });

    if (isAndroid) {
      application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
        data.cancel = true;
        application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
        this.router.navigate(["licenciamento/false/agendar"]);
      });
    }
  }

  onTouch(args: TouchGestureEventData) {
    if (args.action === 'down') {
      args.object.set("backgroundColor", "#cccccc");
      setTimeout(function () {
        args.object.set("backgroundColor", "#00b4b9");
      }, 200);
    }
  }

  onTouchBack(args: TouchGestureEventData) {
    if (args.action === 'down') {
      args.object.set("color", "#00b4b9");
      setTimeout(function () {
        args.object.set("color", this.allowRewind ? "#333333" : "#AAAAAA");
      }, 200);
    }
  }

  showHeader() {
    let month = new Array();
    month[1] = "Janeiro";
    month[2] = "Fevereiro";
    month[3] = "Março";
    month[4] = "Abril";
    month[5] = "Maio";
    month[6] = "Junho";
    month[7] = "Julho";
    month[8] = "Agosto";
    month[9] = "Setembro";
    month[10] = "Outubro";
    month[11] = "Novembro";
    month[12] = "Dezembro";
    this.headerCalendar = month[this.currentMonth] + " " + this.currentYear;
    this.allowRewind = !((new Date().getUTCMonth() + 1).toString() === this.currentMonth.toString() && new Date().getUTCFullYear() === this.currentYear);
  }

  loadCalendar() {
    this.dates = [];
    this.datesCss = [];
    let weekDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
    let lastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

    let day = 1;
    for (let x = 0; x <= 42; x++) {
      if (x < weekDay || day > lastDay) {
        this.dates.push('');
      } else {
        this.dates.push(day.toString());
        day++;
      }
      this.datesCss.push(false);
    }
  }

  loadOccupiedDates() {
    this.datesOccupied = [];
    this.isLoading = true;

    this.ineaService.obterAgendamentoMes(this.currentYear, this.currentMonth)
      .subscribe(agendamento => {
        this.datesOccupied = agendamento;
        this.isLoading = false;

        this.datesOccupied.forEach(agenda => {
          this.datesOccupiedCache.push(agenda);
          for (let x = 0; x < this.dates.length; x++) {
            let currentDate = new Date();
            if (this.currentMonth === (currentDate.getUTCMonth() + 1) && this.currentYear === currentDate.getUTCFullYear()) {
              if (Number(this.dates[x]) === Number(agenda.data.substr(0, 2)) && Number(this.dates[x]) >= currentDate.getUTCDate()) {
                this.datesCss[x] = true;
                break;
              }
            } else {
              if (Number(this.dates[x]) === Number(agenda.data.substr(0, 2))) {
                this.datesCss[x] = true;
                break;
              }
            }
          }
        });

        this.changeDetectionRef.detectChanges();
      }), error => {
        this.isLoading = false;
      };

    this.monthsCache.push(this.currentMonth);
  }

  onRewind() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }

    this.showHeader();
    this.loadCalendar();
    this.loadOccupiedDates();
  }

  onForward() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }

    this.allowRewind = true;
    this.showHeader();
    this.loadCalendar();
    this.loadOccupiedDates();
  }

  onDateSelect(index) {
    this.isLoading = true;
    let that = this;
    setTimeout(function () {
      let diaText = Number(that.dates[index]) > 9 ? that.dates[index] : '0' + that.dates[index];
      let mesText = that.currentMonth.toString().length === 2 ? that.currentMonth.toString() : '0' + that.currentMonth.toString();
      let dataText = diaText + '/' + mesText + '/' + that.currentYear.toString();
      let horarios = that.datesOccupied.filter(d => d.data === dataText)[0].horarios;
      appSettings.setString('inea-horarios', JSON.stringify(horarios));

      that.router.navigate(["licenciamento/false/agendar/editar", dataText, mesText ]);
    }, 50);
  }
}
