import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, ViewContainerRef } from "@angular/core";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { Button } from "ui/button";
import { SearchBar } from "ui/search-bar";
import { PropertyChangeData } from "data/observable";
import { TouchGestureEventData } from "ui/gestures";
import { setTimeout } from "timer";
import { isAndroid, isIOS, screen } from "platform";
import * as application from "application";
import { AndroidApplication, AndroidActivityBackPressedEventData } from "application";
let app = require("application");
let appSettings = require("application-settings");
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";

// DRAWER
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-telerik-ui/sidedrawer";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-telerik-ui/sidedrawer/angular";


// GEOLOCATION
let geolocation = require("nativescript-geolocation");

// FAB BUTTON
import { registerElement } from "nativescript-angular/element-registry";
registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);

// GOOGLE MAPS
registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);
let mapsModule = require("nativescript-google-maps-sdk");
let Color = require("color").Color;

import { IneaService } from "../../shared/inea.service";
import { IneaController } from "../../shared/inea.controller";
import { GeolocationService } from "../../shared/geolocation.service";
import { Municipio, Endereco, Position } from "./municipio.model";
import { Respostas, SelecaoEntidades, AtividadesSelecionadas } from "../../shared/respostas.model";
import { DialogContent } from "../../dialog/dialog-content";
import { Breadcrumb } from "../../shared/breadcrumb.model";

// INCLUIR API DO CLIENTE
// if (app.ios) {
//    GMSServices.provideAPIKey("PUT_API_KEY_HERE");
// }

@Component({
    moduleId: module.id,
    selector: "IneaMunicipio",
    templateUrl: "./municipio.component.html",
    styleUrls: ["./municipio.component.css"],
})

export class MunicipioComponent implements OnInit {
    private municipioListView: Array<Municipio> = [];
    private menuId: number = 0;
    private menuName: string = "";
    private atividadesSelecionadas: Array<AtividadesSelecionadas>;
    private breadcrumbIndex: number;
    private itensEdicao: Array<any>;
    private selectedCount: number = 0;
    private viewType: string = "list";
    private isLoading: boolean = true;
    private canBackNavigation: boolean;
    private tituloMenu: string;

    // BUSCA
    private resultSearchList: Array<Endereco> = [];
    private searchPlace: string = "";
    @ViewChild("sb") private sb: ElementRef;

    // MAPA
    private showMapView: boolean = true;
    private latitude: number = 0;
    private longitude: number = 0;
    private firstMarkLat: number = 0;
    private firstMarkLng: number = 0;
    private zoom: number = 16;
    private points: Array<Position> = [];
    private closePolylines: boolean = false;
    private buscouLocation: boolean = false;
    private selecionouLocal: boolean = false;
    private screenH: number;
    private screenW: number;
    private colorView: string;
    private colorButtonContinuar: string;
    private colorButtonMapa: string;
    private colorButtonVoltar: string;
    private colorButtonBreadcrumb: string;
    @ViewChild("MapView") private mapView: ElementRef;

    // DRAWER
    _sideDrawerTransition: DrawerTransitionBase;
    _drawer: SideDrawerType;
    drawerContentSize: number;
    @ViewChild(RadSideDrawerComponent) drawerComponent: RadSideDrawerComponent;
    buttonCloseDrawerHeigth: number;
    buttonCloseDrawerWidth: number;
    showBottom: boolean;

    // BREADCRUMB
    etapaAtual: string;
    respostaAtual: string;
    breadcrumbList: Array<Breadcrumb> = [];

    constructor(private ineaService: IneaService,
                private geolocationService: GeolocationService,
                private ineaController: IneaController,
                private router: Router,
                private page: Page,
                private changeDetectionRef: ChangeDetectorRef,
                private route: ActivatedRoute,
                private modalService: ModalDialogService,
                private viewContainerRef: ViewContainerRef,
                private routerExtensions: RouterExtensions) {
    }

    // ------------------------------------------------------------------------------------------------------------//
    // EVENTOS NS
    // ------------------------------------------------------------------------------------------------------------//
    ngOnInit() {
        this.isLoading = true;
        this.colorButtonContinuar = "#FFFFFF";
        this.colorButtonMapa = "#00b4b9";
        this.colorButtonVoltar = "#FFFFFF";
        this.colorButtonBreadcrumb = "#00b4b9";
        this.screenH = (screen.mainScreen.heightDIPs - 200) / 2;
        this.screenW = (screen.mainScreen.widthDIPs - 60) / 2;
        this.canBackNavigation = this.ineaController.canBackNavigation();
        this.municipioListView = [];
        this.menuId = 0;
        this.menuName = "";
        this.atividadesSelecionadas = [];
        this.breadcrumbIndex = 0;
        this.itensEdicao = [];
        this.viewType = "list";
        this.resultSearchList = [];
        this.searchPlace = "";
        this.showMapView = true;
        this.latitude = 0;
        this.longitude = 0;
        this.firstMarkLat = 0;
        this.firstMarkLng = 0;
        this.zoom = 16;
        this.points = [];
        this.closePolylines = false;
        this.buscouLocation = false;
        this.selecionouLocal = false;
        this.loadBreadcrumb();

        this.route.params.subscribe(params => {
            this.menuId = params["menuId"];
            this.menuName = params["menuName"];
            this.tituloMenu = params["tituloMenu"];
            if (this.tituloMenu !== undefined && this.tituloMenu.trim() !== "") {
                this.page.actionBar.title = this.tituloMenu;
            }

            this.atividadesSelecionadas = JSON.parse(params["atividadesSelecionadas"]);
            this.colorView = params["cor"] !== undefined ? params["cor"] : "#00b4b9";
            this.page.actionBar.backgroundColor = params["cor"] !== undefined ? new Color(params["cor"]) : new Color("#00b4b9");
            this.breadcrumbIndex = +params["breadcrumbIndex"];
            this.itensEdicao = JSON.parse(params["itensEdicao"]);
            let that = this;

            setTimeout(function () {
                that.municipioListView = JSON.parse(appSettings.getString("inea-municipios") || "[]");

                if (that.municipioListView.length === 0) {
                    this.showModal({type: "inea-municipios", msg: "Nenhum município cadastrado"});
                } else if (that.municipioListView.length > 1) {

                    if (that.breadcrumbIndex !== -1) {
                        that.itensEdicao.forEach(item => {
                            that.ineaController.findMunicipio(that.municipioListView, item.id).selecionado = true;
                            that.selectedCount++;
                        });
                    }

                    that.municipioListView.sort(function (a, b) {
                        return (a.nome < b.nome) ? -1 : (a.nome > b.nome) ? 1 : 0;
                    });
                }

                that.isLoading = false;
                that.changeDetectionRef.detectChanges();

            }, 50);

        });

        let searchBar: SearchBar = this.sb.nativeElement;
        let that = this;
        searchBar.on("propertyChange", function (args) {
            that.onSearchChange(args);
        });

        if (isAndroid) {
          application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            data.cancel = true;
            application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
            if (this.ineaController.canBackNavigation()) {
                this.onNavigationBack();
            } else {
                this.router.navigate(["licenciamento/true/homepage"]);
            }
          });
        }

        this.changeDetectionRef.detectChanges();
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit() {
        this._drawer = this.drawerComponent.sideDrawer;
        this.changeDetectionRef.detectChanges();
    }

    // ------------------------------------------------------------------------------------------------------------//
    // TOGGLE VIEWS
    // ------------------------------------------------------------------------------------------------------------//
    showList() {
        this.viewType = "list";
    }

    showMap() {
        // mapa
        if (this.itensEdicao && this.itensEdicao.length > 0 && this.itensEdicao[0].resposta) {
            this.viewType = "map";
            return;
        }


        if (this.viewType === "list") {
            if (!this.buscouLocation) {
                this.isLoading = true;
                if (!geolocation.isEnabled()) {
                    geolocation.getCurrentLocation({ timeout: 6000 })
                        .then(location => {
                            this.latitude = location.latitude;
                            this.longitude = location.longitude;
                            this.firstMarkLat = location.latitude;
                            this.firstMarkLng = location.longitude;

                            let marker = new mapsModule.Marker();
                            marker.position = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
                            marker.title = "Meu local";
                            marker.icon = "circulo";
                            marker.userData = { index: 1 };
                            this.mapView.nativeElement.addMarker(marker);
                            this.points.push(new Position(this.latitude + this.longitude, this.latitude, this.longitude));
                            this.isLoading = false;
                            this.showMapView = true;
                        })
                        .catch(error => {
                            this.isLoading = false;
                            // alert('Não foi possível determniar sua localização');
                            this.showModal({type: "inea-localizacao-erro", msg: "Não foi possível determniar sua localização"});
                            this.showMapView = true;
                        });
                    this.buscouLocation = true;
                } else {
                    geolocation.getCurrentLocation({ timeout: 10000 })
                        .then(location => {
                            this.latitude = location.latitude;
                            this.longitude = location.longitude;
                            this.firstMarkLat = location.latitude;
                            this.firstMarkLng = location.longitude;

                            let marker = new mapsModule.Marker();
                            marker.position = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
                            marker.title = "Meu local";
                            marker.icon = "circulo";
                            marker.userData = { index: 1 };

                            this.mapView.nativeElement.addMarker(marker);
                            this.points.push(new Position(this.latitude + this.longitude, this.latitude, this.longitude));
                            this.isLoading = false;
                            this.showMapView = true;
                        })
                        .catch(error => {
                            this.isLoading = false;
                            // alert('Não foi possível determniar sua localização');
                            this.showModal({type: "inea-localizacao-erro", msg: "Não foi possível determniar sua localização"});
                            this.showMapView = true;
                        });

                    this.buscouLocation = true;
                }
            }

            this.viewType = "map";
        } else {
            this.showList();
        }
    }

    // ------------------------------------------------------------------------------------------------------------//
    // LISTA MUNICIPIOS
    // ------------------------------------------------------------------------------------------------------------//
    onCheck(item) {
        // marca view
        item.selecionado = !item.selecionado;
        item.selecionado ? this.selectedCount++ : this.selectedCount--;
    }

    onAnswer() {
        this.isLoading = true;

        let processoId = this.ineaController.obterProcesso();
        let selecaoEntidadesMunicipio: Array<SelecaoEntidades> = [];
        let listSelecionados: Array<Municipio> = [];
        let coordenadas = this.points.length > 0 ? ",resposta:" : "";
        this.points.forEach(p => {
            coordenadas = coordenadas + "|" + p.latitude + "|" + p.longitude;
        });
        this.ineaController.setSelecionadosCache(this.municipioListView, listSelecionados);

        listSelecionados.forEach(item => {
            selecaoEntidadesMunicipio.push(new SelecaoEntidades(item.id, "MUNICIPIO", coordenadas, null, null));
        });

        let respostaMunicipio = new Respostas(processoId, this.menuId, "MUNICIPIO", false, 0, false, selecaoEntidadesMunicipio);
        let that = this;
        setTimeout(function () {
            that.ineaController.sendAnswers(respostaMunicipio, that.menuName, that.atividadesSelecionadas,
                that.colorView, that.breadcrumbIndex, 0, "", [], false, 0).subscribe(s => {
                    that.isLoading = false;
                }, error => {
                that.handleErrors(error);
        });
        }, 100);

        
        if (isAndroid) {
          application.android.removeEventListener(AndroidApplication.activityBackPressedEvent);
        }
    }

    onContinuarTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonContinuar = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonContinuar = "#FFFFFF";
        }
    }

    onVoltarTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonVoltar = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonVoltar = "#FFFFFF";
        }
    }

    onBreadcrumbTap() {
        this.router.navigate(["licenciamento/false/breadcrumb"]);
    }

    onBreadcrumbTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonBreadcrumb = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonBreadcrumb = "#00b4b9";
        }
    }

    // ------------------------------------------------------------------------------------------------------------//
    // MAPA
    // ------------------------------------------------------------------------------------------------------------//
    onMapReady = (event) => {
        let map = event.object;
        map._gMap.getUiSettings().setMapToolbarEnabled(false);
        map._gMap.getUiSettings().setZoomControlsEnabled(false);

        if (this.itensEdicao && this.itensEdicao.length > 0 && this.itensEdicao[0].resposta) {
            let coordenadas = this.itensEdicao[0].resposta.split("|") || [];

            if (coordenadas && coordenadas.length > 1) {
                let cont: number = 0;
                let lat: number;
                coordenadas.forEach(c => {
                    if (cont > 0) {
                        if (cont % 2 === 0) {
                            if (cont === 2) {
                                this.showMapVoltar(lat, c);
                                // this.onMapPrint(lat, c);
                            }
                            if (cont > 2) {
                                this.onCoordinatePrint(lat, c);
                            }

                            cont++;

                            if (cont === coordenadas.length) {
                                this.onCloseMarker();
                            }

                        } else {
                            lat = c;
                            cont++;
                        }
                    } else {
                        cont++;
                    }

                });
            }

            this.buscouLocation = true;
        }
    }

    onCoordinateTapped = (event) => {
        if (this.closePolylines)
            return;

        let map = event.object;

        let marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(event.position.latitude, event.position.longitude);
        marker.icon = "circulo";
        map.addMarker(marker);

        if (this.points.length === 0) {
            this.firstMarkLat = event.position.latitude;
            this.firstMarkLng = event.position.longitude;
        }

        let points: Array<any> = [];
        this.points.push(new Position(event.position.latitude + event.position.longitude, event.position.latitude, event.position.longitude));
        this.points.forEach(c => {
            points.push(mapsModule.Position.positionFromLatLng(c.latitude, c.longitude));
        });

        let polyline = new mapsModule.Polyline();
        polyline.addPoints(points);
        polyline.visible = true;
        polyline.width = 6;
        polyline.color = new Color("#0F6FB7");
        polyline.geodesic = true;
        map.addPolyline(polyline);
    }

    onMarkerSelect(event) {
        if (this.closePolylines)
            return;

        let map = event.object;

        if (event.marker.position.latitude === this.firstMarkLat && event.marker.position.longitude === this.firstMarkLng && this.points.length > 1) {

            let _points: Array<any> = [];
            this.points.push(new Position(event.marker.position.latitude + event.marker.position.longitude, event.marker.position.latitude, event.marker.position.longitude));
            this.points.forEach(c => {
                _points.push(mapsModule.Position.positionFromLatLng(c.latitude, c.longitude));
            });

            let polyline = new mapsModule.Polyline();
            polyline.addPoints(_points);
            polyline.visible = true;
            polyline.width = 6;
            polyline.color = new Color("#0F6FB7");
            polyline.geodesic = true;
            map.addPolyline(polyline);


            let polygon = new mapsModule.Polygon();
            polygon.addPoints(_points);
            polygon.visible = true;
            polygon.fillColor = new Color("#A9C9DF");
            map.addPolygon(polygon);

            this.closePolylines = true;
        }
    }

    onFabTap(event) {
        this.onRemoveMarkers();
    }

    onRemoveAllMarkers() {
        this.mapView.nativeElement._markers.forEach(m => {
            this.mapView.nativeElement.removeMarker(m);
        });

        this.mapView.nativeElement._shapes.forEach(s => {
            this.mapView.nativeElement.removeShape(s);
        });

        this.mapView.nativeElement.removeAllMarkers();
        this.mapView.nativeElement.removeAllPolygons();
        this.mapView.nativeElement.removeAllPolylines();
        this.mapView.nativeElement.removeAllPolylines();
        this.mapView.nativeElement.removeAllPolylines();
        this.mapView.nativeElement.removeAllPolylines();
        this.mapView.nativeElement.removeAllPolylines();
        this.mapView.nativeElement.removeAllPolylines();

        this.points = [];
        this.closePolylines = false;
    }

    onRemoveMarkers() {
        if (this.closePolylines) {
            this.mapView.nativeElement.removeAllPolygons();
        }

        let indexMark = this.mapView.nativeElement._markers.length - 1;
        let indexShape = this.mapView.nativeElement._shapes.length - 1;

        if (this.mapView.nativeElement._markers.length > 0) {
            this.mapView.nativeElement.removeMarker(this.mapView.nativeElement._markers[indexMark]);
        }

        if (this.mapView.nativeElement._shapes.length > 0) {
            this.mapView.nativeElement.removeShape(this.mapView.nativeElement._shapes[indexShape]);
        }

        if (this.closePolylines) {
            this.mapView.nativeElement.removeShape(this.mapView.nativeElement._shapes[indexShape - 1]);
            this.points.pop();
            this.closePolylines = false;
        }

        this.points.pop();
    }

    onMapaTouch(args: TouchGestureEventData) {
        if (args.action === "down") {
            this.colorButtonMapa = "#C3C3C3";
        } else if (args.action === "up" || args.action === " cancel") {
            this.colorButtonMapa = "#00b4b9";
        }
    }

    // ------------------------------------------------------------------------------------------------------------//
    // MAPA VOLTAR
    // ------------------------------------------------------------------------------------------------------------//
    showMapVoltar(latitude, longitude) {

        this.resultSearchList = [];
        this.sb.nativeElement.dismissSoftInput();

        this.latitude = latitude;
        this.longitude = longitude;

        this.firstMarkLat = latitude;
        this.firstMarkLng = longitude;

        this.onRemoveAllMarkers();

        let marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
        marker.title = "Meu local";
        marker.userData = { index: 1 };
        marker.icon = "circulo";
        this.mapView.nativeElement.addMarker(marker);
        this.firstMarkLat = this.latitude;
        this.firstMarkLng = this.longitude;

        this.points.push(new Position(this.latitude + this.longitude, this.latitude, this.longitude));
        this.closePolylines = false;
        this.showMapView = true;

        this.selecionouLocal = true;

        this.changeDetectionRef.detectChanges();

    }

    onCoordinatePrint = (latitude, longitude) => {

        let map = this.mapView.nativeElement;
        let marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(latitude, longitude);
        marker.icon = "circulo";
        map.addMarker(marker);

        if (this.points.length === 0) {
            this.firstMarkLat = latitude;
            this.firstMarkLng = longitude;
        }

        let points: Array<any> = [];
        this.points.push(new Position(latitude + longitude, latitude, longitude));
        this.points.forEach(c => {
            points.push(mapsModule.Position.positionFromLatLng(c.latitude, c.longitude));
        });

        let polyline = new mapsModule.Polyline();
        polyline.addPoints(points);
        polyline.visible = true;
        polyline.width = 6;
        polyline.color = new Color("#0F6FB7");
        polyline.geodesic = true;
        map.addPolyline(polyline);

    }

    onCloseMarker() {

        let map = this.mapView.nativeElement;

        let _points: Array<any> = [];
        this.points.forEach(c => {
            _points.push(mapsModule.Position.positionFromLatLng(c.latitude, c.longitude));
        });


        let polyline = new mapsModule.Polyline();
        polyline.addPoints(_points);
        polyline.visible = true;
        polyline.width = 6;
        polyline.color = new Color("#0F6FB7");
        polyline.geodesic = true;
        map.addPolyline(polyline);

        let polygon = new mapsModule.Polygon();
        polygon.addPoints(_points);
        polygon.visible = true;
        polygon.fillColor = new Color("#A9C9DF");
        map.addPolygon(polygon);

        this.closePolylines = true;
    }

    onMapPrint(latitude, longitude) {
        this.resultSearchList = [];
        // this.searchPlace = item.format_address;
        this.sb.nativeElement.dismissSoftInput();

        this.latitude = latitude;
        this.longitude = longitude;

        this.firstMarkLat = latitude;
        this.firstMarkLng = longitude;

        this.onRemoveAllMarkers();

        let marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
        marker.title = "Meu local";
        marker.userData = { index: 1 };
        marker.icon = "circulo";
        this.mapView.nativeElement.addMarker(marker);
        this.firstMarkLat = this.latitude;
        this.firstMarkLng = this.longitude;

        this.points.push(new Position(this.latitude + this.longitude, this.latitude, this.longitude));
        this.closePolylines = false;
        this.showMapView = true;

        this.selecionouLocal = true;

        this.changeDetectionRef.detectChanges();
    }

    // ------------------------------------------------------------------------------------------------------------//
    // BUSCA
    // ------------------------------------------------------------------------------------------------------------//
    onSearchChange(args) {
        if (args["value"].length > 5 && args["value"].substring(0, 12) !== "ng-untouched" && !this.selecionouLocal) {
            this.showMapView = false;
            // setTimeout(() => {
            this.geolocationService.getAddressGeocode(args["value"]).subscribe(result => {
                this.resultSearchList = [];
                let propValue;
                for (let index in result.results) {
                    propValue = result.results[index];

                    let end = new Endereco(propValue.place_id, propValue.formatted_address, propValue.geometry.location.lat, propValue.geometry.location.lng);
                    this.resultSearchList.push(end);
                }

                this.changeDetectionRef.detectChanges();
            });
            // }, 1000);
        }
        this.selecionouLocal = false;
    }

    selectResult(item) {
        this.resultSearchList = [];
        this.searchPlace = item.format_address;
        this.sb.nativeElement.dismissSoftInput();

        this.latitude = item.lat;
        this.longitude = item.lng;

        this.firstMarkLat = item.lat;
        this.firstMarkLng = item.lng;

        this.onRemoveAllMarkers();

        let marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
        marker.title = "Meu local";
        marker.userData = { index: 1 };
        marker.icon = "circulo";
        this.mapView.nativeElement.addMarker(marker);
        this.firstMarkLat = this.latitude;
        this.firstMarkLng = this.longitude;

        this.points.push(new Position(this.latitude + this.longitude, this.latitude, this.longitude));
        this.closePolylines = false;
        this.showMapView = true;

        this.selecionouLocal = true;

        this.changeDetectionRef.detectChanges();
    }

    // ------------------------------------------------------------------------------------------------------------//
    // NAVIGATION
    // ------------------------------------------------------------------------------------------------------------//
    onNavigationBack() {
        this.isLoading = true;
        if (this.ineaController.canBackNavigation()) {
            this.ineaController.navigateBack(this.breadcrumbIndex);
        } else {
            let submenuId: string = appSettings.getString("inea-submenu-id");
            this.router.navigate(["licenciamento/true/submenu/" + submenuId + "/" + this.colorView]);
        }
    }

    wait(milliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(milliSeconds);
            }, milliSeconds);
        });
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


    // ------------------------------------------------------------------------------------------------------------//
    // BOTTOM SIDEDRAWER
    // ------------------------------------------------------------------------------------------------------------//

    private closeDrawer() {
        this._drawer.closeDrawer();
    }

    private onDrawerOpened() {
        this.buttonCloseDrawerHeigth = this.drawerComponent.sideDrawer.getActualSize().height - this.drawerComponent.sideDrawer.drawerContentSize - 20;
        this.buttonCloseDrawerWidth = screen.mainScreen.widthDIPs * 0.8;
        this.showBottom = true;
    }

    private onDrawerClosing() {
        this.showBottom = false;
    }

    private onLoaded(args) {
        this._sideDrawerTransition = new SlideInOnTopTransition();
    }

    private toggleDrawer() {
        this._drawer.toggleDrawerState();
    }

    private get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    // ------------------------------------------------------------------------------------------------------------//
    // BREADCRUMB
    // ------------------------------------------------------------------------------------------------------------//

    onBreadcrumbItemTap(item) {
        if (this.breadcrumbList !== undefined) {
            this.breadcrumbList.forEach(b => {
                b.active = item.index === b.index ? true : false;
            });
        }

        this.changeDetectionRef.detectChanges();
    }

    loadBreadcrumb() {
        this.breadcrumbList = this.ineaController.getBreadcrumb();
        if (this.breadcrumbList !== undefined) {
            this.breadcrumbList.forEach(bc => {
              if (bc.etapa.trim().toUpperCase() === "MUNICIPIO") {
                bc.active = true;
                bc.current = true;
              }
            });
        }

    }

    onBreadcrumbNavigate(item) {
        this.ineaController.navigateCurrent(item.index);
    }

    public handleErrors(error: Response) {
        this.isLoading = false;
        this.showModal({ type: "erro-inesperado" });
    }
}
