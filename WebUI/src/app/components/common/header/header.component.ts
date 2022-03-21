import { Component, HostBinding, OnInit } from '@angular/core';

export const mockServices = [
  {
    systemNames: ['analytics'],
    name: 'Analytics',
    icon: '/assets/applications/ic_cc_launcher_analytics.svg',
    envKey: 'analyticsUrl',
    badge: 'New'
  },
  {
    systemNames: ['predictive'],
    name: 'Predictive',
    icon: '/assets/applications/ic_cc_launcher_predictive.svg',
    envKey: 'predictiveUrl'
  },
  {
    systemNames: ['tipsubmit'],
    name: 'Tipsoft',
    icon: '/assets/applications/ic_cc_launcher_social.svg',
    envKey: 'tipSubmitUrl'
  },
  {
    systemNames: ['msi_admin', 'admin'],
    name: 'Admin',
    icon: '/assets/applications/ic_cc_launcher_admin.svg',
    envKey: 'adminAppUrl'
  },
  {
    systemNames: ['inform'],
    name: 'Inform',
    icon: '/assets/applications/ic_cc_launcher_inform.svg',
    envKey: 'informUrl'
  },
  {
    systemNames: ['aware'],
    name: 'Aware',
    icon: '/assets/applications/ic_cc_launcher_aware.svg',
    envKey: 'awareUrl'
  },
  {
    systemNames: ['vault'],
    name: 'Vault',
    icon: '/assets/applications/ic_cc_launcher_analytics.svg',
    envKey: 'vaultUrl'
  },
  {
    systemNames: ['streaming'],
    name: 'Streaming',
    icon: '/assets/applications/ic_cc_launcher_streaming.svg',
    envKey: 'streamingUrl'
  },
  {
    systemNames: ['OneRms Lsm'],
    name: 'Search',
    icon: '/assets/applications/ic_cc_launcher_search.svg',
    envKey: 'oneRmsUrl'
  },
];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

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

  checkOverflow(header: { checkOverflow: () => void; }) {
    setTimeout(() => header.checkOverflow(), 0);
  }

  searchToggleChatch(e: any) {
    console.log('is search open: ', e);
  }

  searchValueChange(searchText: string) {
    console.log('each input change: ', searchText);
  }

  searchValue(searchText: string) {
    console.log('after enter/search btn click: ', searchText);
  }

  searchInputFocus(): void {
    console.log('search has focused');
  }

  searchInputBlur(): void {
    console.log('search has lost focus');
  }

}
