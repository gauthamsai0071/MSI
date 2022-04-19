import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../app/services/auth/auth.service';
import { AppTabGroupComponent } from '../../../shared/tab-group/tab-group.component';
export const mockServices = [
  {
    systemNames: ['msi_admin', 'admin'],
    name: 'Admin',
    icon: '/assets/applications/ic_cc_launcher_admin.svg',
    envKey: 'adminAppUrl'
  }
];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent { 
  @ViewChild(AppTabGroupComponent) tabGroup: AppTabGroupComponent;
  
  @Input()
  selectedIndex: number;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }
  public mockServices = mockServices;

  @HostBinding('style.width') readonly width: string = '100%';

  header_name = 'Unified Recorder';
  emsignia_enable = true;
  actions_enable = true;
  sessionManager_enable = true;
  agency_enable = true;
  time_enable = true;
  search_enable = true;
  fullWidth_enable = true;
  badge_enable = false;

  tabs_enable = true;
  applications_enable = true;
  support_enable = true;
  responsive_enable = true;
  user_name = (sessionStorage.getItem("username")) ? sessionStorage.getItem("username") : "Hi, User";

  checkOverflow(header: { checkOverflow: () => void; }) {
    setTimeout(() => header.checkOverflow(), 0);
  }
    
  navigateTab(index: number): void {
    this.tabGroup.clickTab(index);  
    this.tabChanged(index);
  }

  tabChanged(index: number) : void {
    if (index === 0)
      this.router.navigateByUrl('/home');
    else if (index === 1) {
      this.router.navigateByUrl('/incidents');
    }
  }

  logout(){
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
  redirectAdmin(){
    const url = "https://dev.ur-na.videomanager.online/app/admin";
    window.open(url, '_self');
  }
}
