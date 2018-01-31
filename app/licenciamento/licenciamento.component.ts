// Nativescript
import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Page } from 'ui/page';

// Drawer
import { DrawerTransitionBase, SlideInOnTopTransition } from 'nativescript-telerik-ui/sidedrawer';
import { RadSideDrawerComponent, SideDrawerType } from 'nativescript-telerik-ui/sidedrawer/angular';

// Inea
import { LoginService } from '../shared/login.service';
import { MenuComponent } from './menu/menu.component';

@Component({
  moduleId: module.id,
  templateUrl: './licenciamento.component.html',
  styleUrls: ['./licenciamento.component.css'],
})

export class LicenciamentoComponent implements OnInit {

  /****** Properties ******/
  @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
  @ViewChild(MenuComponent) public menu: MenuComponent;
  private _sideDrawerTransition: DrawerTransitionBase;
  private _drawer: SideDrawerType;
  private hideDrawer: string;

  /****** Constructor ******/
  constructor(private page: Page,
    private changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService) {
  }

  /****** NS Events ******/
  public ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.hideDrawer = params['hideDrawer'];
      if (this.hideDrawer !== 'true') {
        this.ngAfterViewInit();
      }
    });
  
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (this.hideDrawer !== 'true') {
          this._drawer.closeDrawer();
        }
      }
    });
  }

  public ngAfterViewInit() {
    if (this.hideDrawer === 'true' || this.drawerComponent === undefined) {
      return;
    }
    
    this._drawer = this.drawerComponent.sideDrawer;
    this.menu.drawerComponent = this._drawer;
    this.page.actionBarHidden = false;
    this.changeDetectionRef.detectChanges();
  }

  /****** Logoff ******/
  public onLogoff() {
    this.loginService.logoff();
    this.router.navigate(['/login']);
  }

  /****** Drawer ******/
  public get sideDrawerTransition(): DrawerTransitionBase {
    if (this.hideDrawer === 'true') {
      return;
    }

    return this._sideDrawerTransition;
  }

  public toggle() {
    
    this._drawer.toggleDrawerState();
  }

  public onLoaded(args) {
    if (this.hideDrawer === 'true') {
      return;
    }
    
    alert('entrou onload ');
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }
}