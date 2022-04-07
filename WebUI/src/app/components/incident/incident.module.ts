import { NgModule } from '@angular/core';
import { ModalHeaderDirective, ModalModule, MsiCommonModule, MsiContentModalRef, MsiModalRef, ToastService } from '@msi/cobalt';
import { IncidentSearchComponent } from './search/search.component';
import { IncidentFilterComponent } from './search/filter/filter.component';
import { SharedModule } from '../../shared.module';
import { IncidentSearchService } from '../../services/incident/search.service';
import { IncidentRoutingModule } from './incident-routing.module';
import { IncidentSearchResultComponent } from './search/result/result.component';
import { ManageIncidentComponent } from './manage/manage-incident.component';
import { IncidentService } from '../../services/incident/incident.service';


@NgModule({
  declarations: [
    ManageIncidentComponent,
    IncidentSearchComponent,
    IncidentFilterComponent,
    IncidentSearchResultComponent,    
 ],
  imports: [
    ModalModule,
    SharedModule,
    IncidentRoutingModule
  ],
  providers: [
    ToastService,
    IncidentService,
    IncidentSearchService
  ]
})
export class IncidentModule { }
